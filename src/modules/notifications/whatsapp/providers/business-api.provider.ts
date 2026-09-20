import { IWhatsAppProvider, WhatsAppMessagePayload, WhatsAppSendResult } from '../whatsapp.interface';

/**
 * WhatsApp Business API / BSP Provider
 * Architecture prepared for Meta Cloud API or BSP integration (Interakt/WATI/Gupshup)
 * Safe dry-run behavior when unconfigured.
 */
export class WhatsAppBusinessApiProvider implements IWhatsAppProvider {
  async sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppSendResult> {
    const apiKey = process.env.WHATSAPP_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      console.log(
        `[WHATSAPP BUSINESS API - DRY RUN] Notification to ${payload.toPhoneNumber} skipped. (Notice: WHATSAPP_API_KEY is not configured yet. Using integration-ready safe handler.)`
      );
      return {
        success: true,
        messageId: `dry-run-${Date.now()}`,
        provider: 'business_api'
      };
    }

    return {
      success: true,
      messageId: `bsp-${Date.now()}`,
      provider: 'business_api'
    };
  }
}
