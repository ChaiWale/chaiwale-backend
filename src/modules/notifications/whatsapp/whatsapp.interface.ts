export interface WhatsAppMessagePayload {
  toPhoneNumber: string;
  message: string;
  templateName?: string;
  templateParams?: Record<string, string>;
  mediaUrl?: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  actionUrl?: string; // For link provider (e.g. wa.me link)
  provider: 'link' | 'business_api';
}

export interface IWhatsAppProvider {
  sendMessage(payload: WhatsAppMessagePayload): Promise<WhatsAppSendResult>;
}
