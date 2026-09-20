import { BillingCalculationInput, BillingCalculationResult } from './billing.types';
import {
  BillingRepository,
  CreateInvoiceInput,
  RecordPaymentInput,
  InvoiceFilters
} from './billing.repository';
import { getSupabaseAdminClient } from '../../config/supabase.config';
import { KhataRepository } from '../khata/khata.repository';

export interface GenerateInvoiceInput {
  orderId?: string;
  corporateClientId?: string;
  cateringQuoteId?: string;
  invoiceType: 'DIRECT' | 'CORPORATE_CREDIT' | 'CATERING';
  department?: string;
  customerName?: string;
  customerPhone?: string;
  issueDate?: string;
  items: Array<{
    productId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    taxRatePercent?: number;
  }>;
  overallDiscountPercent?: number;
  additionalCharges?: number;
  paymentMode?: 'CASH' | 'UPI' | 'CREDIT' | 'CARD' | 'SPLIT';
  transactionRef?: string;
}

export class BillingService {
  /**
   * Server-Side Calculation of Bill Totals
   * Authoritative calculation: computes 5% restaurant GST, discounts, and round-offs.
   */
  public static calculateBillTotals(input: BillingCalculationInput): BillingCalculationResult {
    let subtotal = 0;
    let totalTax = 0;

    const itemsSummary = input.items.map((item) => {
      const lineTotal = Number((item.quantity * item.unitPrice).toFixed(2));
      // Zero-tax system: taxRate defaults to 0% (tax not counted)
      const taxRate = item.taxRatePercent !== undefined ? item.taxRatePercent : 0;
      const taxAmount = Number(((lineTotal * taxRate) / 100).toFixed(2));
      const netTotal = Number((lineTotal + taxAmount).toFixed(2));

      subtotal += lineTotal;
      totalTax += taxAmount;

      return {
        ...item,
        lineTotal,
        taxAmount,
        netTotal
      };
    });

    const discountAmount = Number(((subtotal * (input.overallDiscountPercent || 0)) / 100).toFixed(2));
    const grandTotal = Number((subtotal + totalTax - discountAmount + (input.additionalCharges || 0)).toFixed(2));
    const roundedTotal = Math.round(grandTotal);
    const roundOffDifference = Number((roundedTotal - grandTotal).toFixed(2));

    return {
      subtotal: Number(subtotal.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      totalDiscount: discountAmount,
      additionalCharges: input.additionalCharges || 0,
      grandTotal,
      roundedTotal,
      roundOffDifference,
      currency: 'INR',
      items: itemsSummary
    };
  }

  /**
   * Authoritative Bill Generation & Persistence in Supabase
   */
  public static async generateInvoice(input: GenerateInvoiceInput): Promise<{
    invoice: {
      id: string;
      invoiceNumber: string;
      status: string;
      paidAmount: number;
      outstandingAmount: number;
    };
    calculation: BillingCalculationResult;
  }> {
    // 1. Authoritative calculation
    const calculation = this.calculateBillTotals({
      items: input.items,
      overallDiscountPercent: input.overallDiscountPercent || 0,
      additionalCharges: input.additionalCharges || 0,
      billType: input.invoiceType
    });

    // 2. If no orderId provided (direct POS billing), auto-create orders + order_items record so line items and customer details are tracked and printable in KOT & PDF!
    let effectiveOrderId = input.orderId;
    const admin = getSupabaseAdminClient();
    if (!effectiveOrderId && admin) {
      try {
        const orderNumber = `CW-POS-${Date.now().toString().slice(-6)}`;
        const customerLabel = input.customerName
          ? `${input.customerName}${input.customerPhone ? ` (${input.customerPhone})` : ''}`
          : input.department || 'Counter Walk-in';

        const { data: orderData, error: orderErr } = await admin
          .from('orders')
          .insert({
            order_number: orderNumber,
            order_type: 'TAKEAWAY',
            delivery_address: customerLabel,
            subtotal: calculation.subtotal,
            tax_amount: calculation.totalTax,
            discount_amount: calculation.totalDiscount,
            grand_total: calculation.roundedTotal,
            status: 'COMPLETED',
            payment_status: input.paymentMode === 'CREDIT' ? 'PENDING' : 'PAID',
            payment_mode: input.paymentMode || 'CASH',
            transaction_ref: input.transactionRef || null,
            created_at: input.issueDate ? new Date(input.issueDate).toISOString() : new Date().toISOString()
          })
          .select('id')
          .single();

        if (!orderErr && orderData?.id) {
          effectiveOrderId = orderData.id;
          // Insert actual order items from the cart
          const orderItemsToInsert = input.items.map((it) => ({
            order_id: orderData.id,
            item_name: it.name,
            unit_price: it.unitPrice,
            quantity: it.quantity,
            line_total: Number((it.quantity * it.unitPrice).toFixed(2))
          }));
          await admin.from('order_items').insert(orderItemsToInsert);
        }
      } catch (err: any) {
        console.error('Failed to create order snapshot for POS invoice:', err);
      }
    }

    // 3. Persist Invoice in Supabase with exact payment mode & outstanding tracking
    const invoice = await BillingRepository.createInvoice({
      orderId: effectiveOrderId,
      corporateClientId: input.corporateClientId,
      cateringQuoteId: input.cateringQuoteId,
      invoiceType: input.invoiceType,
      department: input.department || (input.customerName ? `${input.customerName}${input.customerPhone ? ` (${input.customerPhone})` : ''}` : undefined),
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      issueDate: input.issueDate,
      paymentMode: input.paymentMode,
      transactionRef: input.transactionRef,
      subtotal: calculation.subtotal,
      taxAmount: calculation.totalTax,
      discountAmount: calculation.totalDiscount,
      grandTotal: calculation.roundedTotal
    });

    // 4. If paymentMode is CREDIT, auto-log items directly to the customer's Khata ledger
    if (input.paymentMode === 'CREDIT') {
      try {
        const targetOffice = await KhataRepository.findOrCreateOffice({
          id: input.corporateClientId,
          phone: input.customerPhone,
          name: input.customerName,
          company_name: input.department,
          floor_unit: input.department
        });

        if (targetOffice) {
          const entryDate = input.issueDate || new Date().toISOString().split('T')[0];
          for (const it of input.items) {
            await KhataRepository.addEntry({
              office_id: targetOffice.id,
              date: entryDate,
              item_name: it.name,
              quantity: it.quantity,
              unit_price: it.unitPrice,
              notes: `POS Bill #${invoice.invoiceNumber}`
            });
          }
        }
      } catch (khataErr) {
        console.error('Failed to auto-record credit invoice into Khata ledger:', khataErr);
      }
    }

    return {
      invoice,
      calculation
    };
  }

  /**
   * Record payment (full or partial) against an invoice
   */
  public static async recordPayment(input: RecordPaymentInput) {
    return BillingRepository.recordPayment(input);
  }

  public static async getInvoices(filters: InvoiceFilters = {}) {
    return BillingRepository.getInvoices(filters);
  }

  public static async getInvoiceById(invoiceId: string) {
    return BillingRepository.getInvoiceById(invoiceId);
  }

  public static async getLedger(clientId?: string, limit = 50) {
    return BillingRepository.getLedger(clientId, limit);
  }

  public static async getCorporateStatement(clientId: string) {
    return BillingRepository.getCorporateStatement(clientId);
  }
}
