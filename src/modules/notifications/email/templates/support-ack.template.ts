import { config } from '../../../../config/env.config';
import {
  renderEmailLayout,
  escapeHtml
} from './email-components';

export interface SupportAcknowledgementData {
  customerName: string;
  referenceId: string;
  subject: string;
  messagePreview?: string;
  receivedAt: string;
  source?: string;
}

export function generateSupportAcknowledgementEmail(data: SupportAcknowledgementData): {
  subject: string;
  html: string;
  text: string;
} {
  const contentHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.6;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 13px; font-weight: 600; color: #6F432A; text-transform: uppercase; letter-spacing: 0.5px;">Customer Care</span>
        <h1 style="margin: 6px 0 0 0; font-size: 22px; font-weight: 700; color: #1A1A1A; line-height: 1.3;">
          We’ve Received Your Message
        </h1>
        <p style="margin: 10px 0 0 0; font-size: 15px; color: #555555;">
          Hello ${escapeHtml(data.customerName)},<br />
          Your message has been received by the Chaiwale team regarding <strong>"${escapeHtml(data.subject)}"</strong> under Reference <strong>#${escapeHtml(data.referenceId)}</strong>.
        </p>
      </div>

      <!-- Reference Details Card -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF7F5; border: 1px solid #ECE5E0; border-radius: 6px; padding: 18px; margin-bottom: 24px;">
        <tr>
          <td width="35%" style="font-size: 13px; color: #777777; padding-bottom: 6px;">Reference Number:</td>
          <td style="font-size: 14px; font-weight: 700; color: #6F432A; padding-bottom: 6px;">#${escapeHtml(data.referenceId)}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #777777; padding-bottom: 6px;">Received At:</td>
          <td style="font-size: 13px; color: #333333; padding-bottom: 6px;">${escapeHtml(data.receivedAt)}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #777777; padding-bottom: 6px;">Topic:</td>
          <td style="font-size: 13px; font-weight: 600; color: #1A1A1A; padding-bottom: 6px;">${escapeHtml(data.subject)}</td>
        </tr>
        ${data.messagePreview ? `
        <tr>
          <td style="font-size: 13px; color: #777777; vertical-align: top; padding-top: 6px;">Your Message:</td>
          <td style="font-size: 13px; color: #555555; line-height: 1.5; padding-top: 6px; font-style: italic;">
            &ldquo;${escapeHtml(data.messagePreview)}&rdquo;
          </td>
        </tr>` : ''}
      </table>

      <!-- Next Steps & Realistic Expectations -->
      <div style="background-color: #FFFFFF; border: 1px solid #ECE5E0; border-radius: 6px; padding: 18px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #1A1A1A;">What happens next?</h3>
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #555555; line-height: 1.5;">
          Our hospitality and operations team is reviewing your message. During standard operating hours (9:00 AM – 11:00 PM IST, Monday through Sunday), our team members respond to customer messages as quickly as they are able.
        </p>
        <p style="margin: 0; font-size: 13px; color: #555555; line-height: 1.5;">
          For urgent inquiries regarding an active in-progress order or immediate catering needs today, we recommend contacting our store counter directly by phone or WhatsApp for instant assistance.
        </p>
      </div>

      <!-- Fast Contact Links -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
        <tr>
          <td align="center" style="font-size: 13px; color: #555555;">
            Direct Store Call: <a href="tel:+919310112564" style="color: #6F432A; font-weight: 700; text-decoration: none;">+91 93101 12564</a> &nbsp;|&nbsp; 
            Official Website: <a href="${config.appUrl}" target="_blank" style="color: #6F432A; font-weight: 700; text-decoration: underline;">chaiwale.co.in</a>
          </td>
        </tr>
      </table>
    </div>
  `;

  const subject = `We’ve Received Your Message — Chaiwale Support`;
  const html = renderEmailLayout({
    title: subject,
    previewText: `Your message has been received by the Chaiwale team under Reference #${data.referenceId}.`,
    contentHtml,
    footerNote: 'Chaiwale Customer Experience Desk'
  });

  const text = `
Hello ${data.customerName},

Your message has been received by the Chaiwale team regarding "${data.subject}".
Reference Number: #${data.referenceId}
Received: ${data.receivedAt}

Our customer desk reviews all communications and will get back to you shortly.
For urgent inquiries regarding active orders, please call us directly at +91 93101 12564 or visit ${config.appUrl}.

Chaiwale Support | Phone: +91 93101 12564 | Website: ${config.appUrl}

This is an automated message from Chaiwale. Please do not reply to this email.
  `.trim();

  return { subject, html, text };
}
