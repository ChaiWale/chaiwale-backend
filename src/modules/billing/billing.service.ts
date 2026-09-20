import { BillingCalculationInput, BillingCalculationResult } from './billing.types';
import {
  BillingRepository,
  CreateInvoiceInput,
  RecordPaymentInput,
  InvoiceFilters
} from './billing.repository';

export interface GenerateInvoiceInput {
  orderId?: string;
  corporateClientId?: string;
  cateringQuoteId?: string;
  invoiceType: 'DIRECT' | 'CORPORATE_CREDIT' | 'CATERING';
  department?: string;
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

    const discountRate = input.overallDiscountPercent || 0;
    const totalDiscount = Number(((subtotal * discountRate) / 100).toFixed(2));
    const additionalCharges = Number((input.additionalCharges || 0).toFixed(2));

    const grandTotal = Number((subtotal + totalTax - totalDiscount + additionalCharges).toFixed(2));
    const roundedTotal = Math.round(grandTotal);

    return {
      items: itemsSummary,
      subtotal: Number(subtotal.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      totalDiscount,
      additionalCharges,
      grandTotal,
      roundedTotal,
      currency: 'INR'
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

    // 2. Persist Invoice in Supabase with exact payment mode & outstanding tracking
    const invoice = await BillingRepository.createInvoice({
      orderId: input.orderId,
      corporateClientId: input.corporateClientId,
      cateringQuoteId: input.cateringQuoteId,
      invoiceType: input.invoiceType,
      department: input.department,
      paymentMode: input.paymentMode,
      transactionRef: input.transactionRef,
      subtotal: calculation.subtotal,
      taxAmount: calculation.totalTax,
      discountAmount: calculation.totalDiscount,
      grandTotal: calculation.roundedTotal
    });

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
