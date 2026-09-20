import { config } from '../../../../config/env.config';
import {
  renderEmailLayout,
  renderEmailButton,
  renderEmailStatusBadge,
  escapeHtml
} from './email-components';

export interface CustomerInvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  companyName?: string;
  customerGstin?: string;
  orderNumber?: string;
  paymentMode: string;
  paymentStatus: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | string;
  subtotal: number;
  discountTotal?: number;
  taxTotal?: number;
  cgst?: number;
  sgst?: number;
  additionalCharges?: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  pdfDownloadUrl?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    amount: number;
  }>;
}

export function generateCustomerInvoiceEmail(data: CustomerInvoiceData): {
  subject: string;
  html: string;
  text: string;
} {
  const downloadUrl = data.pdfDownloadUrl || `${config.appUrl}/invoice/${encodeURIComponent(data.invoiceNumber)}`;

  const itemsRows = data.items
    .map(
      (it) => `
      <tr style="border-bottom: 1px solid #F0ECE9;">
        <td style="padding: 10px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #222222;">
          <strong>${escapeHtml(it.description)}</strong>
        </td>
        <td align="center" style="padding: 10px 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #444444;">
          ${it.quantity}
        </td>
        <td align="right" style="padding: 10px 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #444444;">
          ₹${it.unitPrice.toFixed(2)}
        </td>
        <td align="right" style="padding: 10px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #1A1A1A;">
          ₹${it.amount.toFixed(2)}
        </td>
      </tr>
    `
    )
    .join('');

  const contentHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.6;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 13px; font-weight: 600; color: #6F432A; text-transform: uppercase; letter-spacing: 0.5px;">Tax Invoice</span>
        <h1 style="margin: 6px 0 0 0; font-size: 22px; font-weight: 700; color: #1A1A1A; line-height: 1.3;">
          Invoice #${escapeHtml(data.invoiceNumber)}
        </h1>
        <p style="margin: 10px 0 0 0; font-size: 15px; color: #555555;">
          Dear ${data.companyName ? `${escapeHtml(data.companyName)} (${escapeHtml(data.customerName)})` : escapeHtml(data.customerName)},<br />
          Thank you for patronizing Chaiwale. Please find your itemized tax invoice summary below.
        </p>
      </div>

      <!-- Billing Info Grid -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF7F5; border: 1px solid #ECE5E0; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
        <tr>
          <td width="50%" style="font-size: 13px; color: #666666; padding-bottom: 6px; vertical-align: top;">
            <strong>Invoice Date:</strong> ${escapeHtml(data.invoiceDate)}<br />
            ${data.orderNumber ? `<strong>Order Reference:</strong> #${escapeHtml(data.orderNumber)}<br />` : ''}
            <strong>Payment Mode:</strong> ${escapeHtml(data.paymentMode)}
          </td>
          <td width="50%" align="right" style="font-size: 13px; color: #666666; padding-bottom: 6px; vertical-align: top;">
            <strong>Payment Status:</strong> ${renderEmailStatusBadge(data.paymentStatus)}<br />
            ${data.customerPhone ? `<strong>Phone:</strong> ${escapeHtml(data.customerPhone)}<br />` : ''}
            ${data.customerGstin ? `<strong>GSTIN:</strong> ${escapeHtml(data.customerGstin)}` : ''}
          </td>
        </tr>
      </table>

      <!-- Itemized Products Table -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
        <thead>
          <tr style="border-bottom: 2px solid #6F432A;">
            <th align="left" style="padding-bottom: 8px; font-size: 12px; font-weight: 700; color: #6F432A; text-transform: uppercase;">Description</th>
            <th align="center" style="padding-bottom: 8px; font-size: 12px; font-weight: 700; color: #6F432A; text-transform: uppercase;">Qty</th>
            <th align="right" style="padding-bottom: 8px; font-size: 12px; font-weight: 700; color: #6F432A; text-transform: uppercase;">Rate</th>
            <th align="right" style="padding-bottom: 8px; font-size: 12px; font-weight: 700; color: #6F432A; text-transform: uppercase;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <!-- Financial Calculation Summary -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #ECE5E0; padding-top: 10px; margin-bottom: 24px;">
        <tr>
          <td align="right" style="padding: 4px 0; font-size: 13px; color: #666666;">Subtotal:</td>
          <td align="right" width="110" style="padding: 4px 0; font-size: 13px; color: #333333; font-weight: 600;">₹${data.subtotal.toFixed(2)}</td>
        </tr>
        ${data.discountTotal && data.discountTotal > 0 ? `
        <tr>
          <td align="right" style="padding: 4px 0; font-size: 13px; color: #2E7D32;">Discount:</td>
          <td align="right" style="padding: 4px 0; font-size: 13px; color: #2E7D32; font-weight: 600;">-₹${data.discountTotal.toFixed(2)}</td>
        </tr>` : ''}
        ${data.cgst && data.cgst > 0 ? `
        <tr>
          <td align="right" style="padding: 4px 0; font-size: 13px; color: #666666;">CGST (2.5%):</td>
          <td align="right" style="padding: 4px 0; font-size: 13px; color: #333333; font-weight: 600;">₹${data.cgst.toFixed(2)}</td>
        </tr>` : ''}
        ${data.sgst && data.sgst > 0 ? `
        <tr>
          <td align="right" style="padding: 4px 0; font-size: 13px; color: #666666;">SGST (2.5%):</td>
          <td align="right" style="padding: 4px 0; font-size: 13px; color: #333333; font-weight: 600;">₹${data.sgst.toFixed(2)}</td>
        </tr>` : ''}
        ${data.additionalCharges && data.additionalCharges > 0 ? `
        <tr>
          <td align="right" style="padding: 4px 0; font-size: 13px; color: #666666;">Packaging / Delivery:</td>
          <td align="right" style="padding: 4px 0; font-size: 13px; color: #333333; font-weight: 600;">₹${data.additionalCharges.toFixed(2)}</td>
        </tr>` : ''}
        <tr style="border-top: 2px solid #6F432A;">
          <td align="right" style="padding: 8px 0 4px 0; font-size: 15px; font-weight: 800; color: #1A1A1A;">Total Invoice Amount:</td>
          <td align="right" style="padding: 8px 0 4px 0; font-size: 16px; font-weight: 800; color: #6F432A;">₹${data.grandTotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td align="right" style="padding: 4px 0; font-size: 13px; color: #2E7D32;">Amount Paid:</td>
          <td align="right" style="padding: 4px 0; font-size: 13px; color: #2E7D32; font-weight: 700;">₹${data.amountPaid.toFixed(2)}</td>
        </tr>
        ${data.balanceDue > 0 ? `
        <tr style="border-top: 1px dashed #C62828;">
          <td align="right" style="padding: 6px 0 2px 0; font-size: 14px; font-weight: 700; color: #C62828;">Balance Outstanding:</td>
          <td align="right" style="padding: 6px 0 2px 0; font-size: 15px; font-weight: 800; color: #C62828;">₹${data.balanceDue.toFixed(2)}</td>
        </tr>` : ''}
      </table>

      <!-- Download CTA Button -->
      <div align="center">
        ${renderEmailButton({ text: 'Download Tax Invoice (PDF)', url: downloadUrl })}
      </div>

      <p style="font-size: 13px; color: #777777; margin-top: 20px; line-height: 1.5; text-align: center;">
        For invoice inquiries, please connect with our store desk at <a href="tel:+919310112564" style="color: #6F432A; font-weight: 600; text-decoration: none;">+91 93101 12564</a>.
      </p>
    </div>
  `;

  const subject = `Your Chaiwale Invoice #${data.invoiceNumber}`;
  const html = renderEmailLayout({
    title: subject,
    previewText: `Tax Invoice #${data.invoiceNumber} from Chaiwale - Total ₹${data.grandTotal.toFixed(2)}`,
    contentHtml,
    footerNote: 'Chaiwale GST & Retail Operations | Official Tax Invoice'
  });

  const text = `
Dear ${data.customerName},

Please find your Chaiwale tax invoice summary:
Invoice Number: #${data.invoiceNumber}
Date: ${data.invoiceDate}
Payment Mode: ${data.paymentMode} (${data.paymentStatus})
Invoice Total: ₹${data.grandTotal.toFixed(2)}
Amount Paid: ₹${data.amountPaid.toFixed(2)}
Balance Due: ₹${data.balanceDue.toFixed(2)}

Download complete PDF: ${downloadUrl}

Chaiwale Accounts | Phone: +91 93101 12564 | Website: ${config.appUrl}

This is an automated message from Chaiwale. Please do not reply to this email.
  `.trim();

  return { subject, html, text };
}
