import { config } from '../../../../config/env.config';
import {
  renderEmailLayout,
  renderEmailButton,
  renderEmailStatusBadge,
  escapeHtml
} from './email-components';

export interface OrderItemSummary {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  orderDate: string;
  orderType: string;
  orderStatus?: string;
  deliveryAddress?: string;
  specialInstructions?: string;
  items: OrderItemSummary[];
  subtotal: number;
  discountTotal?: number;
  taxTotal?: number;
  deliveryCharge?: number;
  packagingCharge?: number;
  grandTotal: number;
  paymentMode: string;
  paymentStatus: string;
}

export function generateOrderConfirmationEmail(data: OrderConfirmationData): {
  subject: string;
  html: string;
  text: string;
} {
  const trackingUrl = `${config.appUrl}/track?order=${encodeURIComponent(data.orderNumber)}`;
  const status = (data.orderStatus || 'PENDING').toUpperCase();
  const isPending = status === 'PENDING' || status === 'NEW';

  const itemsRows = data.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #F0ECE9;">
        <td style="padding: 12px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #222222; vertical-align: top;">
          <strong style="color: #1A1A1A;">${escapeHtml(item.name)}</strong>
        </td>
        <td align="center" style="padding: 12px 8px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #444444; vertical-align: top;">
          ${item.quantity}
        </td>
        <td align="right" style="padding: 12px 8px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #444444; vertical-align: top;">
          ₹${item.unitPrice.toFixed(2)}
        </td>
        <td align="right" style="padding: 12px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #1A1A1A; vertical-align: top;">
          ₹${item.total.toFixed(2)}
        </td>
      </tr>
    `
    )
    .join('');

  const waConfirmUrl = `https://wa.me/919310112564?text=${encodeURIComponent(`Hello Chaiwale! I have placed order #${data.orderNumber} (${data.customerName}). Please confirm my order.`)}`;

  const contentHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.6;">
      <div style="margin-bottom: 20px;">
        <span style="font-size: 13px; font-weight: 600; color: #6F432A; text-transform: uppercase; letter-spacing: 0.5px;">Order Details</span>
        <h1 style="margin: 6px 0 0 0; font-size: 22px; font-weight: 700; color: #1A1A1A; line-height: 1.3;">
          ${isPending ? `Order Placed, ${escapeHtml(data.customerName)}!` : `Thank you for your order, ${escapeHtml(data.customerName)}!`}
        </h1>
        <p style="margin: 10px 0 0 0; font-size: 15px; color: #555555;">
          ${isPending
            ? `We have received your order request <strong>#${escapeHtml(data.orderNumber)}</strong>. Please review your order details below.`
            : `We have confirmed your order <strong>#${escapeHtml(data.orderNumber)}</strong>. Our kitchen team has begun preparing your food fresh with authentic spices and wholesome ingredients.`
          }
        </p>
      </div>

      ${isPending ? `
      <!-- Prominent Pending Action Notice -->
      <div style="background-color: #FFFBEB; border: 2px solid #F59E0B; border-radius: 8px; padding: 18px 20px; margin: 20px 0 24px 0; text-align: center;">
        <div style="font-size: 14px; font-weight: 800; color: #B45309; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
          ⚠️ Order Status: PENDING CONFIRMATION
        </div>
        <div style="font-size: 16px; font-weight: 700; color: #78350F; margin-bottom: 8px;">
          Please call the restaurant to confirm your order:
        </div>
        <div style="font-size: 18px; font-weight: 800; color: #6F432A; margin-bottom: 10px;">
          📞 <a href="tel:+919310112564" style="color: #6F432A; text-decoration: none;">+91 93101 12564</a> &nbsp;&nbsp;|&nbsp;&nbsp; 📞 <a href="tel:+919310110414" style="color: #6F432A; text-decoration: none;">+91 93101 10414</a>
        </div>
        <div style="font-size: 13px; color: #92400E; font-weight: 500;">
          Our kitchen will start preparing your order as soon as confirmation is received.
        </div>
        <div style="margin-top: 14px;">
          <a href="${waConfirmUrl}" target="_blank" style="display: inline-block; background-color: #25D366; color: #FFFFFF; font-weight: 700; font-size: 13px; text-decoration: none; padding: 10px 22px; border-radius: 6px; box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3);">
            💬 Confirm Order on WhatsApp
          </a>
        </div>
      </div>
      ` : ''}

      <!-- Order Metadata Box -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF7F5; border: 1px solid #ECE5E0; border-radius: 6px; padding: 16px; margin-bottom: 28px;">
        <tr>
          <td width="50%" style="padding: 6px 0; font-size: 13px; color: #666666;">
            <strong>Order Reference:</strong> #${escapeHtml(data.orderNumber)}
          </td>
          <td width="50%" align="right" style="padding: 6px 0; font-size: 13px; color: #666666;">
            <strong>Status:</strong> ${renderEmailStatusBadge(status)}
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #666666;">
            <strong>Date & Time:</strong> ${escapeHtml(data.orderDate)}
          </td>
          <td align="right" style="padding: 6px 0; font-size: 13px; color: #666666;">
            <strong>Payment Mode:</strong> ${escapeHtml(data.paymentMode)} (${escapeHtml(data.paymentStatus)})
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 6px 0; font-size: 13px; color: #666666;">
            <strong>Fulfillment:</strong> ${escapeHtml(data.orderType.replace(/_/g, ' '))}
            ${data.deliveryAddress ? `<br /><strong>Address:</strong> ${escapeHtml(data.deliveryAddress)}` : ''}
            ${data.specialInstructions ? `<br /><strong>Instructions:</strong> ${escapeHtml(data.specialInstructions)}` : ''}
          </td>
        </tr>
      </table>

      <!-- Itemized Table -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
        <thead>
          <tr style="border-bottom: 2px solid #6F432A;">
            <th align="left" style="padding-bottom: 8px; font-size: 12px; font-weight: 700; color: #6F432A; text-transform: uppercase; letter-spacing: 0.5px;">Item</th>
            <th align="center" style="padding-bottom: 8px; font-size: 12px; font-weight: 700; color: #6F432A; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
            <th align="right" style="padding-bottom: 8px; font-size: 12px; font-weight: 700; color: #6F432A; text-transform: uppercase; letter-spacing: 0.5px;">Rate</th>
            <th align="right" style="padding-bottom: 8px; font-size: 12px; font-weight: 700; color: #6F432A; text-transform: uppercase; letter-spacing: 0.5px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <!-- Totals Table -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #ECE5E0; padding-top: 12px; margin-bottom: 28px;">
        <tr>
          <td align="right" style="padding: 4px 0; font-size: 14px; color: #666666;">Subtotal:</td>
          <td align="right" width="100" style="padding: 4px 0; font-size: 14px; color: #333333; font-weight: 600;">₹${data.subtotal.toFixed(2)}</td>
        </tr>
        ${data.discountTotal && data.discountTotal > 0 ? `
        <tr>
          <td align="right" style="padding: 4px 0; font-size: 14px; color: #2E7D32;">Discount:</td>
          <td align="right" style="padding: 4px 0; font-size: 14px; color: #2E7D32; font-weight: 600;">-₹${data.discountTotal.toFixed(2)}</td>
        </tr>` : ''}
        ${data.taxTotal && data.taxTotal > 0 ? `
        <tr>
          <td align="right" style="padding: 4px 0; font-size: 14px; color: #666666;">GST:</td>
          <td align="right" style="padding: 4px 0; font-size: 14px; color: #333333; font-weight: 600;">₹${data.taxTotal.toFixed(2)}</td>
        </tr>` : ''}
        ${data.deliveryCharge && data.deliveryCharge > 0 ? `
        <tr>
          <td align="right" style="padding: 4px 0; font-size: 14px; color: #666666;">Delivery Fee:</td>
          <td align="right" style="padding: 4px 0; font-size: 14px; color: #333333; font-weight: 600;">₹${data.deliveryCharge.toFixed(2)}</td>
        </tr>` : ''}
        ${data.packagingCharge && data.packagingCharge > 0 ? `
        <tr>
          <td align="right" style="padding: 4px 0; font-size: 14px; color: #666666;">Packaging:</td>
          <td align="right" style="padding: 4px 0; font-size: 14px; color: #333333; font-weight: 600;">₹${data.packagingCharge.toFixed(2)}</td>
        </tr>` : ''}
        <tr style="border-top: 2px solid #6F432A;">
          <td align="right" style="padding: 10px 0 4px 0; font-size: 16px; font-weight: 800; color: #1A1A1A;">Grand Total:</td>
          <td align="right" style="padding: 10px 0 4px 0; font-size: 18px; font-weight: 800; color: #6F432A;">₹${data.grandTotal.toFixed(2)}</td>
        </tr>
      </table>

      <!-- Track CTA Button -->
      <div align="center">
        ${renderEmailButton({ text: 'Track Order Status Live', url: trackingUrl })}
      </div>

      <p style="font-size: 14px; color: #666666; margin-top: 24px; text-align: center;">
        Have a question or need help? Call our store desk at <a href="tel:+919310112564" style="color: #6F432A; font-weight: 600; text-decoration: none;">+91 93101 12564</a> or <a href="tel:+919310110414" style="color: #6F432A; font-weight: 600; text-decoration: none;">+91 93101 10414</a>.
      </p>
    </div>
  `;

  const subject = isPending
    ? `Order Placed #${data.orderNumber} (Pending Confirmation) | Chaiwale`
    : `Your Chaiwale Order #${data.orderNumber} is Confirmed`;

  const html = renderEmailLayout({
    title: subject,
    previewText: isPending
      ? `Order #${data.orderNumber} received. Please call restaurant to confirm.`
      : `Your order #${data.orderNumber} is confirmed and is being prepared fresh.`,
    contentHtml,
    footerNote: 'Thank you for supporting authentic North Indian culinary heritage.'
  });

  const text = `
Dear ${data.customerName},

${isPending ? 'Your order has been placed and is PENDING CONFIRMATION.' : 'Thank you for choosing Chaiwale! Your order is confirmed.'}

Order Reference: #${data.orderNumber}
Status: ${status}
Order Date: ${data.orderDate}
Fulfillment: ${data.orderType}
Payment: ${data.paymentMode} (${data.paymentStatus})
Grand Total: ₹${data.grandTotal.toFixed(2)}

${isPending ? `PLEASE CALL THE RESTAURANT TO CONFIRM YOUR ORDER:
+91 93101 12564 | +91 93101 10414
Our kitchen will start preparing your order as soon as confirmation is received.` : ''}

Track your order live: ${trackingUrl}

Chaiwale | Upper Ground Floor, Vardhman Grand Plaza, G-31, M2K Rd, Mangalam Place, Sector 03, Rohini, New Delhi
Phone: +91 93101 12564 / +91 93101 10414 | Website: ${config.appUrl}

This is an automated message from Chaiwale. Please do not reply to this email.
  `.trim();

  return { subject, html, text };
}
