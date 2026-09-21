import { config } from '../../../config/env.config';
import { EmailPayload, EmailSendResult, IEmailProvider } from './email.interface';
import { ResendEmailProvider } from './resend.provider';
import {
  OrderConfirmationData,
  generateOrderConfirmationEmail,
  OrderStatusUpdateData,
  generateOrderStatusEmail,
  CustomerInvoiceData,
  generateCustomerInvoiceEmail,
  PaymentReceiptData,
  generatePaymentReceiptEmail,
  CorporateReminderData,
  generateCorporateReminderEmail,
  SupportAcknowledgementData,
  generateSupportAcknowledgementEmail,
  SupportInternalData,
  generateSupportInternalEmail,
  LeadNotificationData,
  generateLeadNotificationEmail
} from './templates';

/**
 * Centralized Email Service for Chaiwale Platform
 * Enforces sender identities and production-ready HTML email templates.
 */
export class EmailService implements IEmailProvider {
  private provider: IEmailProvider;

  constructor(providerOverride?: IEmailProvider) {
    this.provider = providerOverride || new ResendEmailProvider();
  }

  /**
   * Generic low-level email dispatch
   */
  async sendEmail(payload: EmailPayload): Promise<EmailSendResult> {
    return this.provider.sendEmail(payload);
  }

  /**
   * 1. Order Confirmation Email
   * Sender: Chaiwale Orders <orders@chaiwale.co.in>
   */
  async sendOrderConfirmation(
    to: string | string[],
    data: OrderConfirmationData
  ): Promise<EmailSendResult> {
    const { subject, html, text } = generateOrderConfirmationEmail(data);
    return this.provider.sendEmail({
      from: config.email.fromOrders,
      to,
      subject,
      html,
      text
    });
  }

  /**
   * 2. Order Status Update Email (Dynamic Status)
   * Sender: Chaiwale Orders <orders@chaiwale.co.in>
   */
  async sendOrderStatusUpdate(
    to: string | string[],
    data: OrderStatusUpdateData
  ): Promise<EmailSendResult> {
    const { subject, html, text } = generateOrderStatusEmail(data);
    return this.provider.sendEmail({
      from: config.email.fromOrders,
      to,
      subject,
      html,
      text
    });
  }

  /**
   * 3. Customer Tax Invoice Email
   * Sender: Chaiwale Invoice <bills@chaiwale.co.in>
   */
  async sendCustomerInvoice(
    to: string | string[],
    data: CustomerInvoiceData,
    pdfBuffer?: Buffer
  ): Promise<EmailSendResult> {
    const { subject, html, text } = generateCustomerInvoiceEmail(data);
    const attachments = pdfBuffer
      ? [
          {
            filename: `Chaiwale-Invoice-${data.invoiceNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      : undefined;

    return this.provider.sendEmail({
      from: config.email.fromBills,
      to,
      subject,
      html,
      text,
      attachments
    });
  }

  /**
   * 4. Payment Receipt Email
   * Sender: Chaiwale Invoice <bills@chaiwale.co.in>
   */
  async sendPaymentReceipt(
    to: string | string[],
    data: PaymentReceiptData
  ): Promise<EmailSendResult> {
    const { subject, html, text } = generatePaymentReceiptEmail(data);
    return this.provider.sendEmail({
      from: config.email.fromBills,
      to,
      subject,
      html,
      text
    });
  }

  /**
   * 5. Corporate / Credit Outstanding Reminder Email
   * Sender: Chaiwale Invoice <bills@chaiwale.co.in>
   */
  async sendCorporateReminder(
    to: string | string[],
    data: CorporateReminderData
  ): Promise<EmailSendResult> {
    const { subject, html, text } = generateCorporateReminderEmail(data);
    return this.provider.sendEmail({
      from: config.email.fromBills,
      to,
      subject,
      html,
      text
    });
  }

  /**
   * 6. Support Acknowledgement Email to Customer
   * Sender: Chaiwale Support <support@chaiwale.co.in>
   */
  async sendSupportAcknowledgement(
    to: string | string[],
    data: SupportAcknowledgementData
  ): Promise<EmailSendResult> {
    const { subject, html, text } = generateSupportAcknowledgementEmail(data);
    return this.provider.sendEmail({
      from: config.email.fromSupport,
      to,
      subject,
      html,
      text
    });
  }

  /**
   * 7. Support / Contact Form Internal Alert to Operations
   * Sender: Chaiwale Support <support@chaiwale.co.in>
   * To: Configured Chaiwale Internal Support Email (chaiwale528@gmail.com)
   */
  async sendSupportInternalNotification(
    data: SupportInternalData
  ): Promise<EmailSendResult> {
    const { subject, html, text } = generateSupportInternalEmail(data);
    const targetEmail = config.email.supportNotificationEmail || 'chaiwale528@gmail.com';

    return this.provider.sendEmail({
      from: config.email.fromSupport,
      to: targetEmail,
      subject,
      html,
      text,
      replyTo: data.senderEmail
    });
  }

  /**
   * 8. High-Priority Lead Notification to Operations (chaiwale528@gmail.com)
   * Dispatches immediate alert for Meal Plan, Catering, Bhandara, or Corporate enquiries.
   */
  async sendLeadNotification(
    data: LeadNotificationData
  ): Promise<EmailSendResult> {
    const { subject, html, text } = generateLeadNotificationEmail(data);
    const targetEmail = config.email.supportNotificationEmail || 'chaiwale528@gmail.com';

    return this.provider.sendEmail({
      from: config.email.fromSupport,
      to: targetEmail,
      subject,
      html,
      text,
      replyTo: data.email || undefined
    });
  }
}

export const emailService = new EmailService();
