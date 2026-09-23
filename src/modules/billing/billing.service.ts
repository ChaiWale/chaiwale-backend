import { BillingCalculationInput, BillingCalculationResult } from './billing.types';
import {
  BillingRepository,
  CreateInvoiceInput,
  RecordPaymentInput,
  InvoiceFilters
} from './billing.repository';
import { getSupabaseAdminClient } from '../../config/supabase.config';
import { KhataRepository } from '../khata/khata.repository';
import { PdfGenerator } from '../documents/pdf.generator';
import { emailService } from '../notifications/email/email.service';


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
      customerPin?: string;
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

    // Compute effective ISO date/time: if only date string is provided, combine with current time
    const resolveEffectiveIssueDate = (issueDate?: string): string => {
      if (!issueDate) return new Date().toISOString();
      const trimmed = issueDate.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const now = new Date();
        const d = new Date(trimmed);
        d.setUTCHours(now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
        return d.toISOString();
      }
      const parsed = new Date(trimmed);
      return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
    };
    const effectiveIssueDate = resolveEffectiveIssueDate(input.issueDate);

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
            created_at: effectiveIssueDate
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
      issueDate: effectiveIssueDate,
      paymentMode: input.paymentMode,
      transactionRef: input.transactionRef,
      subtotal: calculation.subtotal,
      taxAmount: calculation.totalTax,
      discountAmount: calculation.totalDiscount,
      grandTotal: calculation.roundedTotal
    });

    // 4. If customerPhone provided, ensure permanent customer account with 4-digit PIN exists
    let customerPin: string | undefined = undefined;
    if (input.customerPhone && input.customerPhone.trim().replace(/\D/g, '').length >= 7) {
      try {
        const office = await KhataRepository.findOrCreateOffice({
          phone: input.customerPhone,
          name: input.customerName || 'Customer',
          company_name: input.department || 'Retail Customer'
        });
        if (office?.client_pin) {
          customerPin = office.client_pin;
        }
      } catch (pinErr) {
        console.warn('[BillingService] Could not auto-resolve customer PIN:', pinErr);
      }
    }

    // 5. If paymentMode is CREDIT, auto-log items directly to the customer's Khata ledger
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
          if (targetOffice.client_pin) {
            customerPin = targetOffice.client_pin;
          }
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

    // 6. Asynchronously generate PDF and send official email alert to operations (chaiwale528@gmail.com)
    setImmediate(async () => {
      try {
        const fullInvoice = await BillingRepository.getInvoiceById(invoice.id);
        if (!fullInvoice) return;

        const pdfBuffer = await PdfGenerator.generateInvoicePdf(fullInvoice);

        // Persist document to Supabase storage in background
        PdfGenerator.persistDocument(
          pdfBuffer,
          fullInvoice.invoice_type === 'CORPORATE_CREDIT' ? 'CORPORATE_INVOICE' : 'CUSTOMER_INVOICE',
          fullInvoice.invoice_number,
          fullInvoice.id
        ).catch((err) => console.warn('[BillingService] Doc persistence notice:', err.message));

        const issueFormatted = new Date().toLocaleDateString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });

        await emailService.sendCustomerInvoice(
          'chaiwale528@gmail.com',
          {
            invoiceNumber: invoice.invoiceNumber,
            invoiceDate: issueFormatted,
            orderNumber: fullInvoice.orders?.order_number || invoice.invoiceNumber,
            customerName: input.customerName || 'Walk-in Guest',
            customerPhone: input.customerPhone || undefined,
            paymentMode: input.paymentMode || 'CASH',
            paymentStatus: input.paymentMode === 'CREDIT' ? 'UNPAID' : 'PAID',
            subtotal: calculation.subtotal,
            discountTotal: calculation.totalDiscount,
            taxTotal: calculation.totalTax,
            grandTotal: calculation.roundedTotal,
            amountPaid: input.paymentMode === 'CREDIT' ? 0 : calculation.roundedTotal,
            balanceDue: input.paymentMode === 'CREDIT' ? calculation.roundedTotal : 0,
            items: input.items.map((it) => ({
              description: it.name,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              amount: it.quantity * it.unitPrice
            }))
          },
          pdfBuffer
        );
        console.log(`[BillingService] Dispatched invoice PDF #${invoice.invoiceNumber} to chaiwale528@gmail.com`);
      } catch (emailErr: any) {
        console.error(`[BillingService] Failed to dispatch invoice PDF email for #${invoice.invoiceNumber}:`, emailErr.message);
      }
    });

    return {
      invoice: {
        ...invoice,
        customerPin
      },
      calculation
    };
  }

  /**
   * Delete an invoice and cascade delete its linked order (two-way sync)
   */
  public static async deleteInvoice(invoiceId: string) {
    return BillingRepository.deleteInvoice(invoiceId);
  }

  /**
   * Fetch customer's full invoices history with order items for /check-bill
   */
  public static async getCustomerInvoices(phone: string, pin?: string) {
    const cleanPhone = phone.replace(/[\s\-]/g, '').replace(/^\+91/, '').replace(/^91/, '').slice(-10);
    const admin = getSupabaseAdminClient();
    if (!admin) throw new Error('Database client not initialized');

    // 1. Verify PIN against khata_offices if provided
    let accountName = 'Customer';
    if (pin && cleanPhone) {
      const { data: offices } = await admin
        .from('khata_offices')
        .select('*')
        .eq('client_pin', pin.trim().toUpperCase());
      const office = (offices || []).find((o: any) => o.phone.replace(/\D/g, '').endsWith(cleanPhone));
      if (office) {
        accountName = office.name;
      }
    }

    // 2. Fetch all invoices matching the customer phone
    const { data: invoices, error } = await admin
      .from('invoices')
      .select(`
        id,
        invoice_number,
        order_id,
        invoice_type,
        subtotal,
        tax_amount,
        discount_amount,
        grand_total,
        status,
        issued_at,
        created_at,
        paid_amount,
        outstanding_amount,
        department,
        orders (
          id,
          order_number,
          order_type,
          delivery_address,
          status,
          payment_mode,
          payment_status,
          order_items (
            id,
            item_name,
            quantity,
            unit_price,
            line_total
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(`Failed to query customer invoices: ${error.message}`);
    }

    const matched = (invoices || []).filter((inv: any) => {
      const dept = (inv.department || '').toLowerCase();
      const addr = (inv.orders?.delivery_address || '').toLowerCase();
      return dept.includes(cleanPhone) || addr.includes(cleanPhone);
    });

    return {
      accountName,
      phone: cleanPhone,
      invoices: matched
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

