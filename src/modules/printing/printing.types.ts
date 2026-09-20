export interface ReceiptItem {
  name: string;
  quantity: number;
  price?: number;
  total?: number;
  specialInstructions?: string;
}

export interface CustomerReceiptData {
  storeName?: string;
  storeAddress?: string;
  invoiceNumber: string;
  orderNumber?: string;
  date: string;
  customerName?: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paymentMode: string;
  paymentStatus?: string;
}

export interface KotReceiptData {
  orderNumber: string;
  orderType: string;
  date: string;
  tableOrAddress?: string;
  items: Array<{
    name: string;
    quantity: number;
    specialInstructions?: string;
  }>;
}

export interface CreditReceiptData {
  invoiceNumber: string;
  date: string;
  companyName: string;
  department?: string;
  employeeName?: string;
  items: ReceiptItem[];
  grandTotal: number;
}

export interface PrintablePayload {
  receiptType: 'CUSTOMER_BILL' | 'KOT' | 'CREDIT_BILL';
  rawEscPosBytes: Uint8Array;
  base64String: string;
  plainTextPreview: string;
}
