import {
  CustomerReceiptData,
  KotReceiptData,
  CreditReceiptData,
  PrintablePayload
} from './printing.types';
import { BUSINESS_CONFIG } from '../../config/business.config';

// Standard ESC/POS Command Constants
const ESC = '\x1b';
const GS = '\x1d';
const CMD_INIT = `${ESC}@`; // Initialize printer
const CMD_ALIGN_CENTER = `${ESC}a\x01`;
const CMD_ALIGN_LEFT = `${ESC}a\x00`;
const CMD_ALIGN_RIGHT = `${ESC}a\x02`;
const CMD_BOLD_ON = `${ESC}E\x01`;
const CMD_BOLD_OFF = `${ESC}E\x00`;
const CMD_DOUBLE_ON = `${GS}!\x11`; // Double height & width
const CMD_NORMAL = `${GS}!\x00`;
const CMD_CUT = `${GS}V\x41\x10`; // Full cut with feed

export class ReceiptBuilder {
  /**
   * 1. Customer Bill (Full pricing, taxes, payment mode)
   */
  public static buildCustomerBill(data: CustomerReceiptData): PrintablePayload {
    const store = data.storeName || BUSINESS_CONFIG.brandName;
    const address = data.storeAddress || `${BUSINESS_CONFIG.address.locality}, ${BUSINESS_CONFIG.address.city}`;
    const phone = BUSINESS_CONFIG.contact.phone;

    let textPreview = `
================================
          ${store}
    ${address}
    Ph: ${phone}
================================
Inv: ${data.invoiceNumber}
Date: ${data.date}
Mode: ${data.paymentMode} (${data.paymentStatus || 'PAID'})
--------------------------------
ITEM                 QTY  AMOUNT
--------------------------------
${data.items
  .map(
    (it) =>
      `${it.name.slice(0, 18).padEnd(18)} ${String(it.quantity).padStart(3)} ${Number(it.total || 0)
        .toFixed(2)
        .padStart(8)}`
  )
  .join('\n')}
--------------------------------
Subtotal:             Rs. ${Number(data.subtotal).toFixed(2)}
${Number(data.tax) > 0 ? `GST (5%):             Rs. ${Number(data.tax).toFixed(2)}\n` : ''}Grand Total:          Rs. ${Number(data.grandTotal).toFixed(2)}
================================
  Thank You! Have A Great Day!
================================
`.trim();

    // Construct raw ESC/POS command stream
    const escPos = [
      CMD_INIT,
      CMD_ALIGN_CENTER,
      CMD_DOUBLE_ON,
      CMD_BOLD_ON,
      `${store}\n`,
      CMD_NORMAL,
      `${address}\n`,
      `Ph: ${phone}\n`,
      '--------------------------------\n',
      CMD_ALIGN_LEFT,
      `Inv: ${data.invoiceNumber}\n`,
      `Date: ${data.date}\n`,
      `Payment: ${data.paymentMode} (${data.paymentStatus || 'PAID'})\n`,
      '--------------------------------\n',
      'ITEM                 QTY  AMOUNT\n',
      '--------------------------------\n',
      ...data.items.map(
        (it) =>
          `${it.name.slice(0, 18).padEnd(18)} ${String(it.quantity).padStart(3)} ${Number(it.total || 0)
            .toFixed(2)
            .padStart(8)}\n`
      ),
      '--------------------------------\n',
      CMD_ALIGN_RIGHT,
      `Subtotal: Rs. ${Number(data.subtotal).toFixed(2)}\n`,
      ...(Number(data.tax) > 0 ? [`GST (5%): Rs. ${Number(data.tax).toFixed(2)}\n`] : []),
      CMD_BOLD_ON,
      `Grand Total: Rs. ${Number(data.grandTotal).toFixed(2)}\n`,
      CMD_BOLD_OFF,
      CMD_ALIGN_CENTER,
      '================================\n',
      'Thank You! Have A Great Day!\n',
      '\n\n',
      CMD_CUT
    ].join('');

    const rawEscPosBytes = new TextEncoder().encode(escPos);

    return {
      receiptType: 'CUSTOMER_BILL',
      rawEscPosBytes,
      base64String: Buffer.from(rawEscPosBytes).toString('base64'),
      plainTextPreview: textPreview
    };
  }

  /**
   * 2. Kitchen Order Ticket (KOT) — STRICTLY NO PRICES
   */
  public static buildKOT(data: KotReceiptData): PrintablePayload {
    let textPreview = `
================================
   *** KITCHEN ORDER TICKET ***
================================
Order #: ${data.orderNumber}
Type:    ${data.orderType}
Date:    ${data.date}
${data.tableOrAddress ? `Table/Loc: ${data.tableOrAddress}\n` : ''}--------------------------------
ITEM                        QTY
--------------------------------
${data.items
  .map(
    (it) =>
      `${it.name.slice(0, 24).padEnd(24)}  x${String(it.quantity).padStart(3)}${
        it.specialInstructions ? `\n  >> ${it.specialInstructions}` : ''
      }`
  )
  .join('\n')}
================================
       [ PREPARATION QUEUE ]
================================
`.trim();

    const escPos = [
      CMD_INIT,
      CMD_ALIGN_CENTER,
      CMD_DOUBLE_ON,
      CMD_BOLD_ON,
      '*** KITCHEN TICKET (KOT) ***\n',
      CMD_NORMAL,
      '================================\n',
      CMD_ALIGN_LEFT,
      `Order #: ${data.orderNumber}\n`,
      `Type:    ${data.orderType}\n`,
      `Date:    ${data.date}\n`,
      data.tableOrAddress ? `Location: ${data.tableOrAddress}\n` : '',
      '--------------------------------\n',
      CMD_BOLD_ON,
      'ITEM                        QTY\n',
      CMD_BOLD_OFF,
      '--------------------------------\n',
      ...data.items.map(
        (it) =>
          `${it.name.slice(0, 24).padEnd(24)}  x${String(it.quantity).padStart(3)}\n${
            it.specialInstructions ? `  >> Note: ${it.specialInstructions}\n` : ''
          }`
      ),
      '================================\n',
      CMD_ALIGN_CENTER,
      '[ FOR KITCHEN USE ONLY ]\n',
      '\n\n',
      CMD_CUT
    ].join('');

    const rawEscPosBytes = new TextEncoder().encode(escPos);

    return {
      receiptType: 'KOT',
      rawEscPosBytes,
      base64String: Buffer.from(rawEscPosBytes).toString('base64'),
      plainTextPreview: textPreview
    };
  }

  /**
   * 3. Office / Credit Bill (Department & Signature Line)
   */
  public static buildCreditBill(data: CreditReceiptData): PrintablePayload {
    const store = BUSINESS_CONFIG.brandName;
    const address = `${BUSINESS_CONFIG.address.locality}, ${BUSINESS_CONFIG.address.city}`;
    const phone = BUSINESS_CONFIG.contact.phone;

    let textPreview = `
================================
          ${store}
    ${address}
    Ph: ${phone}
================================
    *** OFFICE CREDIT BILL ***
================================
Invoice:    ${data.invoiceNumber}
Date:       ${data.date}
Company:    ${data.companyName}
Department: ${data.department || 'General'}
--------------------------------
ITEM                 QTY  AMOUNT
--------------------------------
${data.items
  .map(
    (it) =>
      `${it.name.slice(0, 18).padEnd(18)} ${String(it.quantity).padStart(3)} ${Number(it.total || 0)
        .toFixed(2)
        .padStart(8)}`
  )
  .join('\n')}
--------------------------------
Grand Total:          Rs. ${Number(data.grandTotal).toFixed(2)}
================================
     [ CREDIT / UNPAID ]
================================
Employee Signature:
________________________________

Authorized Receiver:
________________________________
`.trim();

    const escPos = [
      CMD_INIT,
      CMD_ALIGN_CENTER,
      CMD_DOUBLE_ON,
      CMD_BOLD_ON,
      `${store}\n`,
      CMD_NORMAL,
      `${address}\n`,
      `Ph: ${phone}\n`,
      '================================\n',
      CMD_BOLD_ON,
      '*** OFFICE CREDIT BILL ***\n',
      CMD_NORMAL,
      '================================\n',
      CMD_ALIGN_LEFT,
      `Invoice:    ${data.invoiceNumber}\n`,
      `Date:       ${data.date}\n`,
      `Company:    ${data.companyName}\n`,
      `Department: ${data.department || 'General'}\n`,
      '--------------------------------\n',
      'ITEM                 QTY  AMOUNT\n',
      '--------------------------------\n',
      ...data.items.map(
        (it) =>
          `${it.name.slice(0, 18).padEnd(18)} ${String(it.quantity).padStart(3)} ${Number(it.total || 0)
            .toFixed(2)
            .padStart(8)}\n`
      ),
      '--------------------------------\n',
      CMD_ALIGN_RIGHT,
      CMD_BOLD_ON,
      `Grand Total: Rs. ${Number(data.grandTotal).toFixed(2)}\n`,
      CMD_BOLD_OFF,
      CMD_ALIGN_CENTER,
      '================================\n',
      '       [ CREDIT / UNPAID ]      \n',
      '================================\n',
      CMD_ALIGN_LEFT,
      '\nEmployee Signature:\n________________________________\n\n',
      'Authorized Receiver:\n________________________________\n',
      '\n\n',
      CMD_CUT
    ].join('');

    const rawEscPosBytes = new TextEncoder().encode(escPos);

    return {
      receiptType: 'CREDIT_BILL',
      rawEscPosBytes,
      base64String: Buffer.from(rawEscPosBytes).toString('base64'),
      plainTextPreview: textPreview
    };
  }
}
