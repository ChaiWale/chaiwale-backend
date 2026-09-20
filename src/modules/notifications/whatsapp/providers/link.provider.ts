import { IWhatsAppProvider, WhatsAppMessagePayload, WhatsAppSendResult } from '../whatsapp.interface';

/**
 * WhatsApp Link Provider
 * Generates direct wa.me links for one-click manual customer/staff dispatch
 */
export class WhatsAppLinkProvider implements IWhatsAppProvider {
  async sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppSendResult> {
    const cleanPhone = payload.toPhoneNumber.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(payload.message);
    const linkUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    return {
      success: true,
      actionUrl: linkUrl,
      provider: 'link'
    };
  }
}
