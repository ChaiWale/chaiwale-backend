import { config } from '../../../../config/env.config';
import { BUSINESS_CONFIG } from '../../../../config/business.config';

/**
 * Reusable HTML Email Components for Chaiwale Transactional Emails
 * All components use inline CSS and table-based layouts for maximum email client compatibility.
 */

/**
 * Safely escapes user-controlled strings for HTML insertion to prevent XSS / HTML injection.
 */
export function escapeHtml(unsafe: unknown): string {
  if (unsafe === null || unsafe === undefined) return '';
  const str = String(unsafe);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface LayoutOptions {
  title: string;
  previewText?: string;
  contentHtml: string;
  footerNote?: string;
}

export function renderEmailHeader(): string {
  const appUrl = config.appUrl || BUSINESS_CONFIG.urls.website;
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-bottom: 2px solid #EFE7E2; padding-bottom: 20px; margin-bottom: 28px;">
      <tr>
        <td align="left" style="vertical-align: middle;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align: middle; padding-right: 14px;">
                <a href="${appUrl}" target="_blank" style="text-decoration: none; display: block;">
                  <img src="${BUSINESS_CONFIG.urls.logo}" alt="${BUSINESS_CONFIG.brandName}" width="44" height="44" style="border-radius: 8px; display: block; border: 0;" />
                </a>
              </td>
              <td style="vertical-align: middle;">
                <a href="${appUrl}" target="_blank" style="text-decoration: none; display: block;">
                  <span style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 24px; font-weight: 800; color: ${BUSINESS_CONFIG.colors.primary}; letter-spacing: 0.5px; text-transform: uppercase;">${BUSINESS_CONFIG.brandName.toUpperCase()}</span>
                </a>
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: ${BUSINESS_CONFIG.colors.secondary}; margin-top: 2px; font-weight: 500; letter-spacing: 0.2px;">
                  ${BUSINESS_CONFIG.tagline}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

export function renderEmailFooter(footerNote?: string): string {
  const appUrl = config.appUrl || BUSINESS_CONFIG.urls.website;
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #EFE7E2; margin-top: 36px; padding-top: 24px;">
      ${footerNote ? `
      <tr>
        <td style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.5; color: #666666; padding-bottom: 16px;">
          ${escapeHtml(footerNote)}
        </td>
      </tr>` : ''}
      <tr>
        <td style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.6; color: #777777;">
          <strong style="color: ${BUSINESS_CONFIG.colors.primary}; font-size: 13px; font-weight: 700;">${BUSINESS_CONFIG.brandName}</strong><br />
          ${BUSINESS_CONFIG.address.full}<br />
          Phone: <a href="tel:${BUSINESS_CONFIG.contact.phoneClean}" style="color: ${BUSINESS_CONFIG.colors.primary}; text-decoration: none; font-weight: 600;">${BUSINESS_CONFIG.contact.phone}</a> &nbsp;|&nbsp; 
          Website: <a href="${appUrl}" target="_blank" style="color: ${BUSINESS_CONFIG.colors.primary}; text-decoration: underline; font-weight: 600;">${BUSINESS_CONFIG.urls.website.replace('https://', '')}</a>
        </td>
      </tr>
      <tr>
        <td style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; line-height: 1.5; color: #999999; padding-top: 16px; border-top: 1px dashed #ECE5E0; margin-top: 16px;">
          This is an automated message from ${BUSINESS_CONFIG.brandName}. Please do not reply to this email.<br />
          &copy; ${new Date().getFullYear()} ${BUSINESS_CONFIG.brandName}. All rights reserved.
        </td>
      </tr>
    </table>
  `;
}

export function renderEmailButton(options: { text: string; url: string; color?: string }): string {
  const bg = options.color || '#6F432A';
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td align="center" style="border-radius: 6px; background-color: ${bg};">
          <a href="${options.url}" target="_blank" style="display: inline-block; padding: 12px 28px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 6px; letter-spacing: 0.3px;">
            ${options.text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function renderEmailStatusBadge(status: string): string {
  const norm = (status || '').toUpperCase().trim();
  let bg = '#F2F4F8';
  let color = '#333333';
  let label = status;

  switch (norm) {
    case 'CONFIRMED':
      bg = '#E8F5E9';
      color = '#2E7D32';
      label = 'Confirmed';
      break;
    case 'PREPARING':
      bg = '#FFF3E0';
      color = '#E65100';
      label = 'Preparing in Kitchen';
      break;
    case 'READY':
      bg = '#E3F2FD';
      color = '#1565C0';
      label = 'Ready for Pickup / Dispatch';
      break;
    case 'OUT_FOR_DELIVERY':
    case 'OUT FOR DELIVERY':
      bg = '#F3E5F5';
      color = '#6A1B9A';
      label = 'Out for Delivery';
      break;
    case 'COMPLETED':
    case 'DELIVERED':
      bg = '#E8F5E9';
      color = '#1B5E20';
      label = 'Delivered & Completed';
      break;
    case 'CANCELLED':
      bg = '#FFEBEE';
      color = '#C62828';
      label = 'Cancelled';
      break;
    case 'PAID':
      bg = '#E8F5E9';
      color = '#2E7D32';
      label = 'Paid in Full';
      break;
    case 'PARTIALLY_PAID':
      bg = '#FFF8E1';
      color = '#F57F17';
      label = 'Partially Paid';
      break;
    case 'UNPAID':
      bg = '#FFEBEE';
      color = '#C62828';
      label = 'Payment Pending';
      break;
    default:
      label = status;
  }

  return `
    <span style="display: inline-block; padding: 4px 12px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 12px; background-color: ${bg}; color: ${color};">
      ${label}
    </span>
  `;
}

export function renderEmailLayout(options: LayoutOptions): string {
  const preview = options.previewText
    ? `<div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">${options.previewText}&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F8F6F4; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #222222;">
  ${preview}
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8F6F4; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container (600px) -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #EBE4DE; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 32px 36px;">
          <tr>
            <td>
              ${renderEmailHeader()}
              ${options.contentHtml}
              ${renderEmailFooter(options.footerNote)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
