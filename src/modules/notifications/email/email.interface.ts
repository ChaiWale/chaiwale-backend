export interface EmailPayload {
  to: string | string[];
  from?: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface EmailSendResult {
  success: boolean;
  id?: string;
  error?: string;
  notConfigured?: boolean;
  message?: string;
}

export interface IEmailProvider {
  sendEmail(payload: EmailPayload): Promise<EmailSendResult>;
}
