import { config } from '../../../../config/env.config';
import {
  renderEmailLayout,
  renderEmailButton,
  escapeHtml
} from './email-components';

export interface SupportInternalData {
  referenceId: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  companyName?: string;
  subject: string;
  message: string;
  sourcePage?: string;
  receivedAt: string;
}

export function generateSupportInternalEmail(data: SupportInternalData): {
  subject: string;
  html: string;
  text: string;
} {
  const adminUrl = config.adminUrl;
  const replyMailto = `mailto:${encodeURIComponent(data.senderEmail)}?subject=${encodeURIComponent(`Re: [Ref #${data.referenceId}] ${data.subject}`)}`;

  const contentHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.6;">
      <div style="margin-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 4px; background-color: #EFEBE9; color: #5D4037;">
          Operations Alert &bull; Customer Inquiry
        </span>
        <h1 style="margin: 8px 0 0 0; font-size: 20px; font-weight: 700; color: #1A1A1A;">
          [New Lead/Support] ${escapeHtml(data.subject)}
        </h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #777777;">
          Reference ID: <strong style="color: #6F432A;">#${escapeHtml(data.referenceId)}</strong> &bull; Received: ${escapeHtml(data.receivedAt)}
        </p>
      </div>

      <!-- Customer Details Grid -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF7F5; border: 1px solid #ECE5E0; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
        <tr>
          <td width="35%" style="font-size: 13px; color: #777777; padding-bottom: 6px;">Customer Name:</td>
          <td style="font-size: 14px; font-weight: 700; color: #1A1A1A; padding-bottom: 6px;">${escapeHtml(data.senderName)}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #777777; padding-bottom: 6px;">Customer Email:</td>
          <td style="font-size: 14px; padding-bottom: 6px;">
            <a href="mailto:${encodeURIComponent(data.senderEmail)}" style="color: #6F432A; text-decoration: underline; font-weight: 600;">${escapeHtml(data.senderEmail)}</a>
          </td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #777777; padding-bottom: 6px;">Contact Phone:</td>
          <td style="font-size: 14px; font-weight: 600; color: #1A1A1A; padding-bottom: 6px;">
            ${data.senderPhone ? `<a href="tel:${encodeURIComponent(data.senderPhone)}" style="color: #6F432A; text-decoration: none;">${escapeHtml(data.senderPhone)}</a>` : 'Not provided'}
          </td>
        </tr>
        ${data.companyName ? `
        <tr>
          <td style="font-size: 13px; color: #777777; padding-bottom: 6px;">Company / Org:</td>
          <td style="font-size: 14px; color: #333333; padding-bottom: 6px;">${escapeHtml(data.companyName)}</td>
        </tr>` : ''}
        <tr>
          <td style="font-size: 13px; color: #777777; padding-bottom: 6px;">Inquiry Source:</td>
          <td style="font-size: 13px; color: #555555; padding-bottom: 6px;">${escapeHtml(data.sourcePage || 'Website Contact Form')}</td>
        </tr>
      </table>

      <!-- Message Content -->
      <div style="background-color: #FFFFFF; border: 1px solid #ECE5E0; border-radius: 6px; padding: 18px; margin-bottom: 24px;">
        <h4 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #6F432A; text-transform: uppercase;">Customer Message:</h4>
        <div style="font-size: 14px; line-height: 1.6; color: #222222; white-space: pre-wrap;">${escapeHtml(data.message)}</div>
      </div>

      <!-- Quick Action Buttons -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center">
            <a href="${replyMailto}" style="display: inline-block; padding: 10px 24px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #FFFFFF; background-color: #6F432A; text-decoration: none; border-radius: 6px; margin-right: 12px;">
              Reply by Email
            </a>
            <a href="${adminUrl}" target="_blank" style="display: inline-block; padding: 10px 24px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #6F432A; background-color: #FAF7F5; border: 1px solid #6F432A; text-decoration: none; border-radius: 6px;">
              Open Admin Dashboard
            </a>
          </td>
        </tr>
      </table>
    </div>
  `;

  const subject = `[New Inquiry] ${data.subject} - Ref #${data.referenceId}`;
  const html = renderEmailLayout({
    title: subject,
    previewText: `New inquiry from ${data.senderName} (${data.senderEmail}): ${data.subject}`,
    contentHtml,
    footerNote: 'Internal Operations Dispatch &bull; Chaiwale Operations Notification'
  });

  const text = `
Internal Chaiwale Notification: New Inquiry
Subject: ${data.subject}
Reference ID: #${data.referenceId}
Customer: ${data.senderName} (${data.senderEmail}, ${data.senderPhone || 'N/A'})
${data.companyName ? `Company: ${data.companyName}\n` : ''}Source: ${data.sourcePage || 'Website'}
Received: ${data.receivedAt}

Message:
${data.message}

Admin: ${adminUrl}
  `.trim();

  return { subject, html, text };
}
