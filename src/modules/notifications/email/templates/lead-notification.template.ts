import { config } from '../../../../config/env.config';
import {
  renderEmailLayout,
  escapeHtml
} from './email-components';

export interface LeadNotificationData {
  leadType: 'MEAL_PLAN' | 'CATERING' | 'BHANDARA' | 'CORPORATE';
  referenceId: string;
  customerName: string;
  phone: string;
  email?: string;
  companyName?: string;
  planOrService: string;
  headcountOrPeriod?: string;
  locationOrAddress?: string;
  timingOrDate?: string;
  notes?: string;
  receivedAt?: string;
}

export function generateLeadNotificationEmail(data: LeadNotificationData): {
  subject: string;
  html: string;
  text: string;
} {
  const isMealPlan = data.leadType === 'MEAL_PLAN';
  const typeLabel = isMealPlan ? 'Meal Plan Subscription / Trial' : 'Catering & Bulk Order Enquiry';
  const badgeBg = isMealPlan ? '#F59E0B' : '#C85A17';
  
  const cleanPhone = (data.phone || '').replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(`Hi ${data.customerName}, this is Chaiwale regarding your ${data.planOrService} enquiry (Ref #${data.referenceId}).`)}`;
  const telUrl = `tel:${data.phone}`;

  const subject = isMealPlan
    ? `🍱 [New Meal Plan Lead] ${data.customerName} - ${data.planOrService}`
    : `🍲 [New Catering Enquiry] #${data.referenceId}: ${data.customerName} (${data.planOrService})`;

  const contentHtml = `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #211510; line-height: 1.6;">
      <div style="margin-bottom: 24px;">
        <span style="display: inline-block; padding: 5px 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; border-radius: 999px; background-color: ${badgeBg}; color: #FFFFFF;">
          ${isMealPlan ? '🍱 NEW MEAL PLAN LEAD' : '🍲 NEW CATERING ENQUIRY'}
        </span>
        <h1 style="margin: 10px 0 4px 0; font-size: 22px; font-weight: 800; color: #211510;">
          ${escapeHtml(data.customerName)} — ${escapeHtml(data.planOrService)}
        </h1>
        <p style="margin: 0; font-size: 13px; color: #78665E;">
          Reference ID: <strong style="color: #6F432A;">#${escapeHtml(data.referenceId)}</strong> &bull; Received: ${escapeHtml(data.receivedAt || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }))}
        </p>
      </div>

      <!-- Quick Action Toolbar -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
        <tr>
          <td style="padding-right: 10px;" width="50%">
            <a href="${waUrl}" target="_blank" style="display: block; text-align: center; background-color: #25D366; color: #FFFFFF; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 18px; border-radius: 8px; box-shadow: 0 2px 8px rgba(37,211,102,0.3);">
              💬 Open WhatsApp Chat
            </a>
          </td>
          <td style="padding-left: 10px;" width="50%">
            <a href="${telUrl}" style="display: block; text-align: center; background-color: #6F432A; color: #FFFFFF; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 18px; border-radius: 8px;">
              📞 Call ${escapeHtml(data.phone)}
            </a>
          </td>
        </tr>
      </table>

      <!-- Lead Details Table -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF5EE; border: 1px solid #EAE0D2; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
        <tr>
          <td width="36%" style="font-size: 13px; color: #8A786F; font-weight: 600; padding: 8px 0; border-bottom: 1px solid #EAE0D2;">Lead Type:</td>
          <td style="font-size: 14px; font-weight: 700; color: #211510; padding: 8px 0; border-bottom: 1px solid #EAE0D2;">${escapeHtml(typeLabel)}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #8A786F; font-weight: 600; padding: 8px 0; border-bottom: 1px solid #EAE0D2;">Customer Name:</td>
          <td style="font-size: 14px; font-weight: 700; color: #211510; padding: 8px 0; border-bottom: 1px solid #EAE0D2;">${escapeHtml(data.customerName)}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #8A786F; font-weight: 600; padding: 8px 0; border-bottom: 1px solid #EAE0D2;">Phone / WhatsApp:</td>
          <td style="font-size: 14px; font-weight: 700; color: #6F432A; padding: 8px 0; border-bottom: 1px solid #EAE0D2;">
            <a href="${telUrl}" style="color: #6F432A; text-decoration: none;">${escapeHtml(data.phone)}</a>
          </td>
        </tr>
        ${data.email ? `
        <tr>
          <td style="font-size: 13px; color: #8A786F; font-weight: 600; padding: 8px 0; border-bottom: 1px solid #EAE0D2;">Email:</td>
          <td style="font-size: 14px; padding: 8px 0; border-bottom: 1px solid #EAE0D2;">
            <a href="mailto:${encodeURIComponent(data.email)}" style="color: #6F432A; text-decoration: underline;">${escapeHtml(data.email)}</a>
          </td>
        </tr>` : ''}
        ${data.companyName ? `
        <tr>
          <td style="font-size: 13px; color: #8A786F; font-weight: 600; padding: 8px 0; border-bottom: 1px solid #EAE0D2;">Company / Organization:</td>
          <td style="font-size: 14px; font-weight: 600; color: #211510; padding: 8px 0; border-bottom: 1px solid #EAE0D2;">${escapeHtml(data.companyName)}</td>
        </tr>` : ''}
        <tr>
          <td style="font-size: 13px; color: #8A786F; font-weight: 600; padding: 8px 0; border-bottom: 1px solid #EAE0D2;">Selected Plan / Service:</td>
          <td style="font-size: 14px; font-weight: 800; color: #C85A17; padding: 8px 0; border-bottom: 1px solid #EAE0D2;">${escapeHtml(data.planOrService)}</td>
        </tr>
        ${data.headcountOrPeriod ? `
        <tr>
          <td style="font-size: 13px; color: #8A786F; font-weight: 600; padding: 8px 0; border-bottom: 1px solid #EAE0D2;">Guest Count / Duration:</td>
          <td style="font-size: 14px; font-weight: 600; color: #211510; padding: 8px 0; border-bottom: 1px solid #EAE0D2;">${escapeHtml(data.headcountOrPeriod)}</td>
        </tr>` : ''}
        ${data.locationOrAddress ? `
        <tr>
          <td style="font-size: 13px; color: #8A786F; font-weight: 600; padding: 8px 0; border-bottom: 1px solid #EAE0D2;">Delivery Address / Location:</td>
          <td style="font-size: 14px; font-weight: 600; color: #211510; padding: 8px 0; border-bottom: 1px solid #EAE0D2;">📍 ${escapeHtml(data.locationOrAddress)}</td>
        </tr>` : ''}
        ${data.timingOrDate ? `
        <tr>
          <td style="font-size: 13px; color: #8A786F; font-weight: 600; padding: 8px 0; border-bottom: 1px solid #EAE0D2;">Timing / Event Date:</td>
          <td style="font-size: 14px; font-weight: 600; color: #211510; padding: 8px 0; border-bottom: 1px solid #EAE0D2;">🕒 ${escapeHtml(data.timingOrDate)}</td>
        </tr>` : ''}
        <tr>
          <td style="font-size: 13px; color: #8A786F; font-weight: 600; padding: 8px 0;">Special Requests / Notes:</td>
          <td style="font-size: 14px; color: #4B3B35; padding: 8px 0;">${escapeHtml(data.notes || 'None specified')}</td>
        </tr>
      </table>

      <!-- Next Steps Reminder -->
      <div style="background-color: #FFFFFF; border: 1px solid #EAE0D2; border-radius: 8px; padding: 14px 18px; font-size: 13px; color: #78665E;">
        <strong style="color: #6F432A;">Operational Action Required:</strong> Please contact this lead within 15 minutes to confirm their menu preferences, delivery slot, and address feasibility.
      </div>
    </div>
  `;

  const html = renderEmailLayout({
    title: subject,
    previewText: `New lead from ${data.customerName} for ${data.planOrService}`,
    contentHtml,
    footerNote: 'This is an automated priority lead alert generated by the Chaiwale Website System.'
  });

  const text = `
=== ${subject} ===
Reference ID: #${data.referenceId}
Customer Name: ${data.customerName}
Phone: ${data.phone}
Email: ${data.email || 'N/A'}
Company: ${data.companyName || 'N/A'}
Selected Plan/Service: ${data.planOrService}
Location/Address: ${data.locationOrAddress || 'N/A'}
Timing/Date: ${data.timingOrDate || 'N/A'}
Special Requests: ${data.notes || 'None'}

Direct WhatsApp: ${waUrl}
Call: ${telUrl}
  `.trim();

  return { subject, html, text };
}
