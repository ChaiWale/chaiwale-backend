import { config } from '../../../../config/env.config';
import {
  renderEmailLayout,
  renderEmailButton,
  renderEmailStatusBadge,
  escapeHtml
} from './email-components';

export type OrderStatusType =
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED'
  | string;

export interface OrderStatusUpdateData {
  customerName: string;
  orderNumber: string;
  status: OrderStatusType;
  updatedAt: string;
  orderType: string;
  deliveryAddress?: string;
  estimatedTime?: string;
  statusNote?: string;
}

interface StatusNarrative {
  subject: string;
  headline: string;
  message: string;
  actionText: string;
}

function getStatusNarrative(status: string, orderNumber: string): StatusNarrative {
  const norm = (status || '').toUpperCase().trim();

  switch (norm) {
    case 'CONFIRMED':
      return {
        subject: `Your Chaiwale Order #${orderNumber} is Confirmed`,
        headline: 'Your order is confirmed and in queue',
        message:
          'We have verified your order details and scheduled it with our kitchen. Preparation will begin shortly.',
        actionText: 'View Order Status'
      };
    case 'PREPARING':
      return {
        subject: `Your Chaiwale Order #${orderNumber} is Now Being Prepared`,
        headline: 'Our kitchen is actively preparing your order',
        message:
          'Great news! Our chefs have started handcrafting your items with fresh ingredients and traditional spices. Your culinary experience is on its way.',
        actionText: 'Track Preparation'
      };
    case 'READY':
      return {
        subject: `Your Chaiwale Order #${orderNumber} is Ready!`,
        headline: 'Your order is freshly packed and ready',
        message:
          'Your food and chai are hot, packed securely in insulated packaging, and ready for pickup or dispatch.',
        actionText: 'Track Order'
      };
    case 'OUT_FOR_DELIVERY':
    case 'OUT FOR DELIVERY':
      return {
        subject: `Your Chaiwale Order #${orderNumber} is Out for Delivery`,
        headline: 'Your order is on the road to you',
        message:
          'Our delivery team has picked up your order and is heading to your address. Please keep your phone reachable.',
        actionText: 'Track Rider'
      };
    case 'COMPLETED':
    case 'DELIVERED':
      return {
        subject: `Your Chaiwale Order #${orderNumber} has been Delivered`,
        headline: 'Enjoy your meal & thank you for choosing Chaiwale!',
        message:
          'Your order has been completed and delivered. We hope you love the taste of authentic culinary heritage.',
        actionText: 'Reorder Favorites'
      };
    case 'CANCELLED':
      return {
        subject: `Important Update Regarding Your Chaiwale Order #${orderNumber}`,
        headline: 'Your order has been cancelled',
        message:
          'We regret to inform you that your order has been cancelled. If any payment was completed, our team is processing your refund automatically.',
        actionText: 'Contact Support'
      };
    default:
      return {
        subject: `Update on Your Chaiwale Order #${orderNumber}`,
        headline: `Order Status: ${status}`,
        message: `Your order status has updated to ${status}.`,
        actionText: 'View Order'
      };
  }
}

export function generateOrderStatusEmail(data: OrderStatusUpdateData): {
  subject: string;
  html: string;
  text: string;
} {
  const narrative = getStatusNarrative(data.status, data.orderNumber);
  const trackingUrl = `${config.appUrl}/track?order=${encodeURIComponent(data.orderNumber)}`;

  const contentHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.6;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 13px; font-weight: 600; color: #6F432A; text-transform: uppercase; letter-spacing: 0.5px;">Order Status Update</span>
        <h1 style="margin: 6px 0 0 0; font-size: 22px; font-weight: 700; color: #1A1A1A; line-height: 1.3;">
          ${narrative.headline}
        </h1>
        <p style="margin: 10px 0 0 0; font-size: 15px; color: #555555;">
          Hello ${escapeHtml(data.customerName)}, ${narrative.message}
        </p>
      </div>

      <!-- Status Summary Card -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF7F5; border: 1px solid #ECE5E0; border-radius: 6px; padding: 18px; margin-bottom: 24px;">
        <tr>
          <td width="40%" style="font-size: 13px; color: #777777; padding-bottom: 8px;">Order Reference:</td>
          <td width="60%" style="font-size: 14px; font-weight: 700; color: #1A1A1A; padding-bottom: 8px;">#${escapeHtml(data.orderNumber)}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #777777; padding-bottom: 8px;">Current Status:</td>
          <td style="padding-bottom: 8px;">${renderEmailStatusBadge(data.status)}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #777777; padding-bottom: 8px;">Fulfillment Type:</td>
          <td style="font-size: 14px; color: #333333; padding-bottom: 8px;">${escapeHtml(data.orderType.replace(/_/g, ' '))}</td>
        </tr>
        ${data.estimatedTime ? `
        <tr>
          <td style="font-size: 13px; color: #777777; padding-bottom: 8px;">Estimated ETA:</td>
          <td style="font-size: 14px; font-weight: 600; color: #6F432A; padding-bottom: 8px;">${escapeHtml(data.estimatedTime)}</td>
        </tr>` : ''}
        ${data.deliveryAddress ? `
        <tr>
          <td style="font-size: 13px; color: #777777; vertical-align: top;">Delivery Address:</td>
          <td style="font-size: 13px; color: #444444; line-height: 1.4;">${escapeHtml(data.deliveryAddress)}</td>
        </tr>` : ''}
        ${data.statusNote ? `
        <tr>
          <td style="font-size: 13px; color: #777777; vertical-align: top; padding-top: 8px;">Note:</td>
          <td style="font-size: 13px; color: #444444; line-height: 1.4; padding-top: 8px;">${escapeHtml(data.statusNote)}</td>
        </tr>` : ''}
      </table>

      <!-- Track CTA Button -->
      <div align="center">
        ${renderEmailButton({ text: narrative.actionText, url: trackingUrl })}
      </div>

      <p style="font-size: 13px; color: #777777; margin-top: 24px; text-align: center;">
        Need to contact us immediately? Call our store desk directly at <a href="tel:+919310112564" style="color: #6F432A; font-weight: 600; text-decoration: none;">+91 93101 12564</a>.
      </p>
    </div>
  `;

  const html = renderEmailLayout({
    title: narrative.subject,
    previewText: narrative.headline,
    contentHtml,
    footerNote: 'Thank you for choosing Chaiwale.'
  });

  const text = `
Hello ${data.customerName},

${narrative.headline}
Order Reference: #${data.orderNumber}
Status: ${data.status}
Updated: ${data.updatedAt}

${narrative.message}

Track your order live: ${trackingUrl}

Chaiwale Rohini | Phone: +91 93101 12564 | Website: ${config.appUrl}

This is an automated message from Chaiwale. Please do not reply to this email.
  `.trim();

  return {
    subject: narrative.subject,
    html,
    text
  };
}
