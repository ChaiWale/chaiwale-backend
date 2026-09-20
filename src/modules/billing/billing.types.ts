/**
 * Central Billing Engine Types
 * Used exclusively by backend billing engine.
 * Frontends consume calculations produced by this engine.
 */

export type PaymentStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
export type PaymentMode = 'CASH' | 'UPI' | 'CARD' | 'CREDIT' | 'SPLIT';
export type BillType = 'DIRECT' | 'CORPORATE_CREDIT' | 'CATERING';

export interface BillingItemInput {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  taxRatePercent?: number;
  discountPercent?: number;
}

export interface BillingCalculationInput {
  items: BillingItemInput[];
  overallDiscountPercent?: number;
  additionalCharges?: number;
  billType: BillType;
}

export interface BillingItemSummary extends BillingItemInput {
  lineTotal: number;
  taxAmount: number;
  netTotal: number;
}

export interface BillingCalculationResult {
  items: BillingItemSummary[];
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  additionalCharges: number;
  grandTotal: number;
  roundedTotal: number;
  roundOffDifference?: number;
  currency: string;
}
