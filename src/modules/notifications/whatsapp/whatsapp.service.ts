import { IWhatsAppProvider, WhatsAppMessagePayload, WhatsAppSendResult } from './whatsapp.interface';
import { WhatsAppLinkProvider } from './providers/link.provider';
import { WhatsAppBusinessApiProvider } from './providers/business-api.provider';
import { config } from '../../../config/env.config';

/**
 * WhatsApp Service Orchestrator
 * Automatically delegates to active provider (wa.me link or Business API/BSP)
 */
export class WhatsAppService {
  private provider: IWhatsAppProvider;

  constructor(providerOverride?: IWhatsAppProvider) {
    if (providerOverride) {
      this.provider = providerOverride;
    } else if (config.whatsapp.provider === 'business_api') {
      this.provider = new WhatsAppBusinessApiProvider();
    } else {
      this.provider = new WhatsAppLinkProvider();
    }
  }

  async send(payload: WhatsAppMessagePayload): Promise<WhatsAppSendResult> {
    return this.provider.sendMessage(payload);
  }
}
