import { config } from '../../../../config/env.config';
import {
  renderEmailLayout,
  renderEmailButton,
  renderEmailStatusBadge,
  escapeHtml
} from './email-components';

export interface PaymentReceiptData {
  customerName: string;
  companyName?: string;
  invoiceNumber: string;
  paymentDate: string;
  amountReceived: number;
  paymentMode: 'CASH' | 'UPI' | 'CREDIT' | string;
  transactionRef?: string;
  previousOutstanding: number;
  remainingOutstanding: number;
  finalStatus: 'PAID' | 'PARTIALLY_PAID' | string;
  invoiceUrl?: string;
}

export function generatePaymentReceiptEmail(data: PaymentReceiptData): {
  subject: string;
  html: string;
  text: string;
} {
  const invoiceLink = data.invoiceUrl || `${config.appUrl}/invoice/${encodeURIComponent(data.invoiceNumber)}`;

  const contentHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.6;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 13px; font-weight: 600; color: #2E7D32; text-transform: uppercase; letter-spacing: 0.5px;">Official Payment Receipt</span>
        <h1 style="margin: 6px 0 0 0; font-size: 22px; font-weight: 700; color: #1A1A1A; line-height: 1.3;">
          Payment Received — Thank You!
        </h1>
        <p style="margin: 10px 0 0 0; font-size: 15px; color: #555555;">
          Dear ${data.companyName ? `${escapeHtml(data.companyName)} (${escapeHtml(data.customerName)})` : escapeHtml(data.customerName)},<br />
          We have successfully received and credited your payment of <strong>₹${data.amountReceived.toFixed(2)}</strong> toward invoice <strong>#${escapeHtml(data.invoiceNumber)}</strong>.
        </p>
      </div>

      <!-- Receipt Highlight Card -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF7F5; border: 1px solid #ECE5E0; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
        <tr>
          <td style="font-size: 13px; color: #777777; padding-bottom: 8px;">Invoice Reference:</td>
          <td align="right" style="font-size: 14px; font-weight: 700; color: #1A1A1A; padding-bottom: 8px;">#${escapeHtml(data.invoiceNumber)}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #777777; padding-bottom: 8px;">Payment Date & Time:</td>
          <td align="right" style="font-size: 14px; color: #333333; padding-bottom: 8px;">${escapeHtml(data.paymentDate)}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #777777; padding-bottom: 8px;">Payment Mode:</td>
          <td align="right" style="font-size: 14px; color: #333333; padding-bottom: 8px;">${escapeHtml(data.paymentMode)}</td>
        </tr>
        ${data.transactionRef ? `
        <tr>
          <td style="font-size: 13px; color: #777777; padding-bottom: 8px;">Transaction / UTR Ref:</td>
          <td align="right" style="font-size: 13px; font-family: monospace; color: #6F432A; padding-bottom: 8px;">${escapeHtml(data.transactionRef)}</td>
        </tr>` : ''}
        <tr style="border-top: 1px solid #ECE5E0;">
          <td style="font-size: 15px; font-weight: 700; color: #2E7D32; padding-top: 12px; padding-bottom: 8px;">Amount Received:</td>
          <td align="right" style="font-size: 18px; font-weight: 800; color: #2E7D32; padding-top: 12px; padding-bottom: 8px;">₹${data.amountReceived.toFixed(2)}</td>
        </tr>
      </table>

      <!-- Ledger Accounting Summary -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #EAE5E1; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
        <tr>
          <td style="font-size: 13px; color: #666666; padding-bottom: 6px;">Previous Outstanding:</td>
          <td align="right" style="font-size: 14px; color: #666666; padding-bottom: 6px;">₹${data.previousOutstanding.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #2E7D32; padding-bottom: 6px;">Payment Applied:</td>
          <td align="right" style="font-size: 14px; color: #2E7D32; font-weight: 600; padding-bottom: 6px;">-₹${data.amountReceived.toFixed(2)}</td>
        </tr>
        <tr style="border-top: 1px solid #EAE5E1;">
          <td style="font-size: 14px; font-weight: 700; color: #1A1A1A; padding-top: 8px;">Remaining Outstanding:</td>
          <td align="right" style="font-size: 15px; font-weight: 800; color: ${data.remainingOutstanding > 0 ? '#C62828' : '#2E7D32'}; padding-top: 8px;">
            ₹${data.remainingOutstanding.toFixed(2)}
          </td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #666666; padding-top: 8px;">Invoice Settlement Status:</td>
          <td align="right" style="padding-top: 8px;">
            ${renderEmailStatusBadge(data.finalStatus)}
          </td>
        </tr>
      </table>

      <!-- View Receipt / Invoice CTA -->
      <div align="center">
        ${renderEmailButton({ text: 'View Updated Invoice Details', url: invoiceLink })}
      </div>

      <p style="font-size: 13px; color: #777777; margin-top: 24px; text-align: center;">
        If you have any questions regarding your statement or payments, please contact our store desk at <a href="tel:+919310112564" style="color: #6F432A; font-weight: 600; text-decoration: none;">+91 93101 12564</a>.
      </p>
    </div>
  `;

  const subject = `Payment Received — Chaiwale Invoice #${data.invoiceNumber}`;
  const html = renderEmailLayout({
    title: subject,
    previewText: `Payment of ₹${data.amountReceived.toFixed(2)} received for invoice #${data.invoiceNumber}.`,
    contentHtml,
    footerNote: 'Thank you for your timely settlement. Chaiwale Finance & Accounts Desk.'
  });

  const text = `
Dear ${data.customerName},

Payment of ₹${data.amountReceived.toFixed(2)} received for Invoice #${data.invoiceNumber}.
Payment Date: ${data.paymentDate}
Payment Mode: ${data.paymentMode}
${data.transactionRef ? `Transaction Ref: ${data.transactionRef}\n` : ''}Previous Outstanding: ₹${data.previousOutstanding.toFixed(2)}
Remaining Outstanding: ₹${data.remainingOutstanding.toFixed(2)}
Status: ${data.finalStatus}

View updated invoice: ${invoiceLink}

Chaiwale Accounts | Phone: +91 93101 12564 | Website: ${config.appUrl}

This is an automated message from Chaiwale. Please do not reply to this email.
  `.trim();

  return { subject, html, text };
}
