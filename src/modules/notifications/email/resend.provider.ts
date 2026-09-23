import { config } from '../../../config/env.config';
import { EmailPayload, EmailSendResult, IEmailProvider } from './email.interface';

export class ResendEmailProvider implements IEmailProvider {
  /**
   * Dispatches email via Resend API.
   * If RESEND_API_KEY is missing or a placeholder, returns a clear non-dispatch
   * result without crashing, faking delivery, or simulating success.
   */
  async sendEmail(payload: EmailPayload): Promise<EmailSendResult> {
    const apiKey = config.email.apiKey;
    const recipient = Array.isArray(payload.to) ? payload.to.join(', ') : payload.to;

    // Check if key is absent or placeholder
    const isUnconfigured =
      !apiKey ||
      apiKey.trim() === '' ||
      apiKey.includes('<YOUR_') ||
      apiKey.includes('re_xxxx') ||
      apiKey.startsWith('your_');

    if (isUnconfigured) {
      console.log(
        `[RESEND EMAIL] Delivery skipped for: ${recipient} | Subject: "${payload.subject}". (Notice: RESEND_API_KEY is not configured. Email dispatch skipped.)`
      );
      return {
        success: false,
        notConfigured: true,
        message: 'RESEND_API_KEY is not configured. Email dispatch skipped.'
      };
    }

    try {
      const fromAddress = payload.from || config.email.fromOrders;

      const bodyPayload: Record<string, any> = {
        from: fromAddress,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text
      };

      if (payload.cc) {
        bodyPayload.cc = Array.isArray(payload.cc) ? payload.cc : [payload.cc];
      }

      if (payload.bcc) {
        bodyPayload.bcc = Array.isArray(payload.bcc) ? payload.bcc : [payload.bcc];
      }

      if (payload.replyTo) {
        bodyPayload.reply_to = payload.replyTo;
      }

      if (payload.attachments && payload.attachments.length > 0) {
        bodyPayload.attachments = payload.attachments.map((att) => ({
          filename: att.filename,
          content: Buffer.isBuffer(att.content) ? att.content.toString('base64') : att.content,
          content_type: att.contentType
        }));
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify(bodyPayload)
      });

      const data = (await response.json()) as any;

      if (!response.ok) {
        console.error(`[RESEND EMAIL] API dispatch error: ${data.message || response.statusText}`);
        // If domain is unverified on Resend, automatically fallback to onboarding@resend.dev to guarantee delivery
        if (fromAddress !== 'onboarding@resend.dev' && (response.status === 403 || String(data.message || '').toLowerCase().includes('domain'))) {
          console.log(`[RESEND EMAIL] Retrying with fallback sender onboarding@resend.dev for recipient: ${recipient}...`);
          bodyPayload.from = 'Chaiwale Alerts <onboarding@resend.dev>';
          const retryRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify(bodyPayload)
          });
          const retryData = (await retryRes.json()) as any;
          if (retryRes.ok) {
            console.log(`[RESEND EMAIL] Fallback dispatch succeeded (ID: ${retryData.id}) to ${recipient}`);
            return {
              success: true,
              id: retryData.id
            };
          }
          console.error(`[RESEND EMAIL] Fallback dispatch also failed: ${retryData.message || retryRes.statusText}`);
        }
        return {
          success: false,
          error: data.message || 'Resend dispatch failed'
        };
      }

      console.log(`[RESEND EMAIL] Dispatched email successfully (ID: ${data.id}) to ${recipient}`);
      return {
        success: true,
        id: data.id
      };
    } catch (err: any) {
      console.error(`[RESEND EMAIL] Network dispatch exception: ${err.message}`);
      return {
        success: false,
        error: err.message || 'Network exception during Resend dispatch'
      };
    }
  }
}
