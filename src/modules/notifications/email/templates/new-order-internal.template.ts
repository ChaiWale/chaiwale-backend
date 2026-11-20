import { config } from '../../../../config/env.config';
import {
  renderEmailLayout,
  renderEmailButton,
  renderEmailStatusBadge,
  escapeHtml
} from './email-components';

export interface NewOrderItemSummary {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface NewOrderInternalData {
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  orderDate: string;
  orderType: string;
  deliveryAddress?: string;
  specialInstructions?: string;
  items: NewOrderItemSummary[];
  subtotal: number;
  discountTotal?: number;
  taxTotal?: number;
  deliveryCharge?: number;
  packagingCharge?: number;
  grandTotal: number;
  paymentMode: string;
  paymentStatus: string;
}

export function generateNewOrderInternalEmail(data: NewOrderInternalData): {
  subject: string;
  html: string;
  text: string;
} {
  const adminOrdersUrl = `${config.adminUrl}/orders`;

  const itemsRows = data.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #F0ECE9;">
        <td style="padding: 10px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #1A1A1A; vertical-align: top;">
          <strong>${escapeHtml(item.name)}</strong>
        </td>
        <td align="center" style="padding: 10px 8px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #333333; vertical-align: top; font-weight: 600;">
          x${item.quantity}
        </td>
        <td align="right" style="padding: 10px 8px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #555555; vertical-align: top;">
          ₹${item.unitPrice.toFixed(2)}
        </td>
        <td align="right" style="padding: 10px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; color: #6F432A; vertical-align: top;">
          ₹${item.total.toFixed(2)}
        </td>
      </tr>
    `
    )
    .join('');

  const cleanPhone = data.customerPhone ? data.customerPhone.replace(/\D/g, '') : '';
  const waCustomerUrl = cleanPhone
    ? `https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(`Hello ${data.customerName}! We have received your Chaiwale order #${data.orderNumber}.`)}`
    : null;

  const contentHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; line-height: 1.6;">
      <!-- Urgent Alert Banner -->
      <div style="background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); border-radius: 8px; padding: 18px 20px; color: #FFFFFF; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.25);">
        <div style="font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #FEE2E2;">
          🚨 Action Required — Kitchen & Operations Alert
        </div>
        <h1 style="margin: 6px 0 4px 0; font-size: 24px; font-weight: 800; color: #FFFFFF; line-height: 1.2;">
          New Order Received: #${escapeHtml(data.orderNumber)}
        </h1>
        <div style="font-size: 15px; color: #FEF2F2; font-weight: 500;">
          Placed on Website &bull; Total: <strong>₹${data.grandTotal.toFixed(2)}</strong> &bull; Payment: <strong>${escapeHtml(data.paymentMode)}</strong>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
        <tr>
          <td align="center" style="padding: 4px;">
            <a href="${adminOrdersUrl}" target="_blank" style="display: block; background-color: #6F432A; color: #FFFFFF; text-align: center; font-size: 14px; font-weight: 700; text-decoration: none; padding: 13px 20px; border-radius: 6px; letter-spacing: 0.3px;">
              📋 Open Admin Live Orders
            </a>
          </td>
          ${data.customerPhone ? `
          <td align="center" style="padding: 4px;">
            <a href="tel:${escapeHtml(data.customerPhone)}" style="display: block; background-color: #047857; color: #FFFFFF; text-align: center; font-size: 14px; font-weight: 700; text-decoration: none; padding: 13px 20px; border-radius: 6px; letter-spacing: 0.3px;">
              📞 Call Customer (${escapeHtml(data.customerPhone)})
            </a>
          </td>
          ` : ''}
          ${waCustomerUrl ? `
          <td align="center" style="padding: 4px;">
            <a href="${waCustomerUrl}" target="_blank" style="display: block; background-color: #25D366; color: #FFFFFF; text-align: center; font-size: 14px; font-weight: 700; text-decoration: none; padding: 13px 20px; border-radius: 6px; letter-spacing: 0.3px;">
              💬 WhatsApp
            </a>
          </td>
          ` : ''}
        </tr>
      </table>

      <!-- Order Details Summary -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF7F5; border: 1px solid #ECE5E0; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
        <tr>
          <td width="50%" style="padding: 6px 0; font-size: 13px; color: #666666;">
            <strong>Order ID:</strong> #${escapeHtml(data.orderNumber)}
          </td>
          <td width="50%" align="right" style="padding: 6px 0; font-size: 13px; color: #666666;">
            <strong>Order Status:</strong> ${renderEmailStatusBadge('PENDING')}
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #666666;">
            <strong>Order Placed:</strong> ${escapeHtml(data.orderDate)}
          </td>
          <td align="right" style="padding: 6px 0; font-size: 13px; color: #666666;">
            <strong>Fulfillment:</strong> <span style="font-weight: 700; color: #1A1A1A;">${escapeHtml(data.orderType.replace(/_/g, ' '))}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #666666;">
            <strong>Customer Name:</strong> <strong style="color: #1A1A1A;">${escapeHtml(data.customerName)}</strong>
          </td>
          <td align="right" style="padding: 6px 0; font-size: 13px; color: #666666;">
            <strong>Customer Phone:</strong> ${data.customerPhone ? `<a href="tel:${escapeHtml(data.customerPhone)}" style="color: #6F432A; font-weight: 700; text-decoration: underline;">${escapeHtml(data.customerPhone)}</a>` : '<span style="color: #999999;">Not Provided</span>'}
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 6px 0; font-size: 13px; color: #666666; border-top: 1px dashed #E5DDD7; margin-top: 6px;">
            <strong>Customer Email:</strong> ${data.customerEmail ? `<a href="mailto:${escapeHtml(data.customerEmail)}" style="color: #6F432A; text-decoration: underline;">${escapeHtml(data.customerEmail)}</a>` : '<span style="color: #999999;">Not Provided</span>'}
          </td>
        </tr>
        ${data.deliveryAddress ? `
        <tr>
          <td colspan="2" style="padding: 6px 0; font-size: 13px; color: #666666;">
            <strong>📍 Delivery Address:</strong> <span style="color: #1A1A1A; font-weight: 600;">${escapeHtml(data.deliveryAddress)}</span>
          </td>
        </tr>` : ''}
        ${data.specialInstructions ? `
        <tr>
          <td colspan="2" style="padding: 6px 0; font-size: 13px; color: #B45309; background-color: #FFFBEB; border-radius: 4px; padding: 8px;">
            <strong>📝 Special Instructions:</strong> ${escapeHtml(data.specialInstructions)}
          </td>
        </tr>` : ''}
      </table>

      <!-- Items Table -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
        <thead>
          <tr style="border-bottom: 2px solid #6F432A;">
            <th align="left" style="padding-bottom: 8px; font-size: 12px; font-weight: 700; color: #6F432A; text-transform: uppercase; letter-spacing: 0.5px;">Item Name</th>
            <th align="center" style="padding-bottom: 8px; font-size: 12px; font-weight: 700; color: #6F432A; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
            <th align="right" style="padding-bottom: 8px; font-size: 12px; font-weight: 700; color: #6F432A; text-transform: uppercase; letter-spacing: 0.5px;">Rate</th>
            <th align="right" style="padding-bottom: 8px; font-size: 12px; font-weight: 700; color: #6F432A; text-transform: uppercase; letter-spacing: 0.5px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <!-- Totals & Payment Breakdown -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #ECE5E0; padding-top: 10px; margin-bottom: 24px;">
        <tr>
          <td align="right" style="padding: 4px 0; font-size: 14px; color: #666666;">Subtotal:</td>
          <td align="right" width="110" style="padding: 4px 0; font-size: 14px; color: #333333; font-weight: 600;">₹${data.subtotal.toFixed(2)}</td>
        </tr>
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
        <tr>
          <td align="right" style="padding: 4px 0; font-size: 13px; color: #666666;">Payment Mode:</td>
          <td align="right" style="padding: 4px 0; font-size: 13px; color: #1A1A1A; font-weight: 700;">${escapeHtml(data.paymentMode)} (${escapeHtml(data.paymentStatus)})</td>
        </tr>
      </table>

      <!-- Bottom Admin Link -->
      <div style="background-color: #F1F5F9; border-radius: 6px; padding: 14px; text-align: center;">
        <span style="font-size: 13px; color: #475569;">
          Log in to the Admin Live Orders console to accept and advance this order through kitchen preparation.
        </span>
        <div style="margin-top: 8px;">
          <a href="${adminOrdersUrl}" target="_blank" style="color: #6F432A; font-weight: 700; text-decoration: underline; font-size: 13px;">
            Go to Admin Live Orders →
          </a>
        </div>
      </div>
    </div>
  `;

  const subject = `🚨 [NEW ORDER] #${data.orderNumber} — ₹${data.grandTotal.toFixed(2)} (${data.customerName})`;
  const html = renderEmailLayout({
    title: subject,
    previewText: `New order #${data.orderNumber} received from ${data.customerName} for ₹${data.grandTotal.toFixed(2)}.`,
    contentHtml,
    footerNote: 'This is an internal operations dispatch for Chaiwale Restaurant & Kitchen Management.'
  });

  const text = `
🚨 [NEW ORDER RECEIVED] #${data.orderNumber}
Customer: ${data.customerName}
Phone: ${data.customerPhone || 'N/A'}
Email: ${data.customerEmail || 'N/A'}
Order Date: ${data.orderDate}
Fulfillment: ${data.orderType}
Delivery Address: ${data.deliveryAddress || 'Pickup / Dine-in'}
Special Instructions: ${data.specialInstructions || 'None'}

Grand Total: ₹${data.grandTotal.toFixed(2)}
Payment: ${data.paymentMode} (${data.paymentStatus})

Open Admin Live Orders: ${adminOrdersUrl}
${data.customerPhone ? `Call Customer: tel:${data.customerPhone}` : ''}
  `.trim();

  return { subject, html, text };
}
