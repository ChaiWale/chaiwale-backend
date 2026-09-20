import { config } from '../../../../config/env.config';
import { BUSINESS_CONFIG } from '../../../../config/business.config';
import {
  renderEmailLayout,
  renderEmailButton,
  escapeHtml
} from './email-components';

export interface CorporateReminderData {
  companyName: string;
  contactPersonName?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  totalAmount: number;
  amountPaid: number;
  outstandingAmount: number;
  paymentTerms?: string;
  upiId?: string;
  statementUrl?: string;
}

export function generateCorporateReminderEmail(data: CorporateReminderData): {
  subject: string;
  html: string;
  text: string;
} {
  const statementLink = data.statementUrl || `${config.appUrl}/invoice/${encodeURIComponent(data.invoiceNumber)}`;
  const upiId = data.upiId || BUSINESS_CONFIG.payment.defaultUpiId;

  const contentHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.6;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 13px; font-weight: 600; color: #8D6E63; text-transform: uppercase; letter-spacing: 0.5px;">Account Statement Notice</span>
        <h1 style="margin: 6px 0 0 0; font-size: 22px; font-weight: 700; color: #1A1A1A; line-height: 1.3;">
          Payment Reminder — Invoice #${escapeHtml(data.invoiceNumber)}
        </h1>
        <p style="margin: 10px 0 0 0; font-size: 15px; color: #555555;">
          Dear ${data.contactPersonName ? `${escapeHtml(data.contactPersonName)} and Team at ${escapeHtml(data.companyName)}` : escapeHtml(data.companyName)},<br />
          We hope this message finds you well. This is a gentle reminder regarding the outstanding balance on invoice <strong>#${escapeHtml(data.invoiceNumber)}</strong> for corporate catering / hospitality services provided by Chaiwale.
        </p>
      </div>

      <!-- Outstanding Balance Highlight -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF7F5; border: 1px solid #ECE5E0; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
        <tr>
          <td style="font-size: 13px; color: #777777; padding-bottom: 8px;">Client / Account:</td>
          <td align="right" style="font-size: 14px; font-weight: 700; color: #1A1A1A; padding-bottom: 8px;">${escapeHtml(data.companyName)}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #777777; padding-bottom: 8px;">Invoice Reference:</td>
          <td align="right" style="font-size: 14px; font-weight: 600; color: #6F432A; padding-bottom: 8px;">#${escapeHtml(data.invoiceNumber)}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #777777; padding-bottom: 8px;">Invoice Date:</td>
          <td align="right" style="font-size: 14px; color: #333333; padding-bottom: 8px;">${escapeHtml(data.invoiceDate)}</td>
        </tr>
        ${data.dueDate ? `
        <tr>
          <td style="font-size: 13px; color: #777777; padding-bottom: 8px;">Due Date / Terms:</td>
          <td align="right" style="font-size: 14px; color: #D32F2F; font-weight: 600; padding-bottom: 8px;">${escapeHtml(data.dueDate)} ${data.paymentTerms ? `(${escapeHtml(data.paymentTerms)})` : ''}</td>
        </tr>` : ''}
        <tr>
          <td style="font-size: 13px; color: #777777; padding-bottom: 8px;">Total Billed:</td>
          <td align="right" style="font-size: 14px; color: #333333; padding-bottom: 8px;">₹${data.totalAmount.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #2E7D32; padding-bottom: 8px;">Amount Paid:</td>
          <td align="right" style="font-size: 14px; color: #2E7D32; font-weight: 600; padding-bottom: 8px;">₹${data.amountPaid.toFixed(2)}</td>
        </tr>
        <tr style="border-top: 2px solid #6F432A;">
          <td style="font-size: 15px; font-weight: 700; color: #1A1A1A; padding-top: 10px;">Current Outstanding:</td>
          <td align="right" style="font-size: 18px; font-weight: 800; color: #C62828; padding-top: 10px;">₹${data.outstandingAmount.toFixed(2)}</td>
        </tr>
      </table>

      <!-- Settlement Instructions -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFFFF; border: 1px solid #ECE5E0; border-radius: 6px; padding: 18px; margin-bottom: 24px;">
        <tr>
          <td style="font-size: 14px; font-weight: 700; color: #6F432A; padding-bottom: 8px;">
            Payment Settlement Instructions:
          </td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #555555; line-height: 1.6;">
            <strong>UPI ID:</strong> <span style="font-family: monospace; color: #1A1A1A;">${upiId}</span><br />
            <strong>Account Name:</strong> Shubham Sharma / Chaiwale<br />
            <strong>IMPS/NEFT:</strong> Available on invoice statement<br />
            <em>Kindly quote invoice #${data.invoiceNumber} in the payment narration or share the UTR reference for immediate reconciliation.</em>
          </td>
        </tr>
      </table>

      <!-- CTA Button -->
      <div align="center">
        ${renderEmailButton({ text: 'Review Invoice & Settlement Details', url: statementLink })}
      </div>

      <p style="font-size: 13px; color: #777777; margin-top: 24px; line-height: 1.5; text-align: center;">
        If payment has already been initiated, please accept our thanks and disregard this notice. For statement reconciliations or account queries, please contact our store desk at <a href="tel:+919310112564" style="color: #6F432A; font-weight: 600; text-decoration: none;">+91 93101 12564</a>.
      </p>
    </div>
  `;

  const subject = `Payment Reminder — Chaiwale Invoice #${data.invoiceNumber}`;
  const html = renderEmailLayout({
    title: subject,
    previewText: `Payment reminder for Chaiwale invoice #${data.invoiceNumber}. Outstanding: ₹${data.outstandingAmount.toFixed(2)}`,
    contentHtml,
    footerNote: 'Chaiwale Corporate Accounts & Institutional Billing Desk'
  });

  const text = `
Dear ${data.companyName},

Payment reminder for invoice #${data.invoiceNumber} dated ${data.invoiceDate}.
Total Billed: ₹${data.totalAmount.toFixed(2)}
Amount Paid: ₹${data.amountPaid.toFixed(2)}
Current Outstanding: ₹${data.outstandingAmount.toFixed(2)}
${data.dueDate ? `Due Date: ${data.dueDate}\n` : ''}
Payment Mode: UPI ID ${upiId} or Bank Transfer.
Review invoice details: ${statementLink}

Chaiwale Accounts | Phone: +91 93101 12564 | Website: ${config.appUrl}

This is an automated message from Chaiwale. Please do not reply to this email.
  `.trim();

  return { subject, html, text };
}
