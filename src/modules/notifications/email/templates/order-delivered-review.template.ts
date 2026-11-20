import { config } from '../../../../config/env.config';
import { BUSINESS_CONFIG } from '../../../../config/business.config';
import {
  renderEmailLayout,
  renderEmailButton,
  escapeHtml
} from './email-components';

export interface OrderDeliveredReviewData {
  orderNumber: string;
  customerName: string;
  grandTotal?: number;
  googleReviewUrl?: string;
  deliveredDate?: string;
}

export function generateOrderDeliveredReviewEmail(data: OrderDeliveredReviewData): {
  subject: string;
  html: string;
  text: string;
} {
  const reviewUrl = data.googleReviewUrl || BUSINESS_CONFIG.urls.googleReview || 'https://g.page/r/Ca1qOd1BBfkEEBM/review';
  const trackingUrl = `${config.appUrl}/track?order=${encodeURIComponent(data.orderNumber)}`;

  const contentHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.6; text-align: center;">
      <!-- Delivered Badge -->
      <div style="display: inline-block; background-color: #DCFCE7; color: #166534; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px;">
        ✅ Order Delivered
      </div>

      <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 800; color: #1A1A1A; line-height: 1.3;">
        Hope you loved your meal, ${escapeHtml(data.customerName)}!
      </h1>

      <p style="margin: 0 auto 16px auto; font-size: 15px; color: #555555; max-width: 500px;">
        Your Chaiwale order <strong>#${escapeHtml(data.orderNumber)}</strong> has been delivered. We hope every sip of freshly brewed chai and every bite of food brought warmth and joy to your day!
      </p>

      <!-- Review Card Box -->
      <div style="background-color: #FAF7F5; border: 2px dashed #E5DDD7; border-radius: 12px; padding: 24px 20px; margin: 24px auto; max-width: 520px;">
        <div style="font-size: 32px; line-height: 1; margin-bottom: 10px; color: #F59E0B; letter-spacing: 4px;">
          &#9733;&#9733;&#9733;&#9733;&#9733;
        </div>
        <div style="font-size: 17px; font-weight: 800; color: #6F432A; margin-bottom: 8px;">
          How was your experience?
        </div>
        <p style="font-size: 14px; color: #666666; margin: 0 0 18px 0; line-height: 1.5;">
          As an authentic North Indian kitchen, your genuine feedback means the world to our cooks and operations team. Could you please take 30 seconds to rate us on Google?
        </p>

        <!-- Golden Google Review CTA Button -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);">
              <a href="${reviewUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 800; color: #FFFFFF; text-decoration: none; border-radius: 8px; letter-spacing: 0.3px;">
                ⭐ Rate Chaiwale on Google
              </a>
            </td>
          </tr>
        </table>
      </div>

      <!-- Secondary Links -->
      <div style="margin-top: 24px; font-size: 13px; color: #777777;">
        Need to view your order receipt or check details?  
        <a href="${trackingUrl}" target="_blank" style="color: #6F432A; font-weight: 600; text-decoration: underline; margin-left: 4px;">
          View Order #${escapeHtml(data.orderNumber)}
        </a>
      </div>

      <p style="font-size: 13px; color: #999999; margin-top: 20px;">
        Have any feedback or issues with your order? Reply to this email or call our desk at <a href="tel:+919310112564" style="color: #6F432A; text-decoration: none; font-weight: 600;">+91 93101 12564</a>.
      </p>
    </div>
  `;

  const subject = `How was your meal? Rate Chaiwale on Google ⭐ | #${data.orderNumber}`;
  const html = renderEmailLayout({
    title: subject,
    previewText: `Your order #${data.orderNumber} is delivered! Rate your experience on Google.`,
    contentHtml,
    footerNote: 'Thank you for supporting authentic North Indian culinary heritage.'
  });

  const text = `
Dear ${data.customerName},

Your Chaiwale order #${data.orderNumber} has been delivered! We hope you loved your food and chai.

Could you please take 30 seconds to share your review on Google? It means the world to our kitchen team:
${reviewUrl}

Track or view order details: ${trackingUrl}

Thank you for choosing Chaiwale!
Chaiwale Cafe & Catering
Upper Ground Floor, Vardhman Grand Plaza, G-31, Sector 03, Rohini, New Delhi
Phone: +91 93101 12564 | Website: ${config.appUrl}
  `.trim();

  return { subject, html, text };
}
