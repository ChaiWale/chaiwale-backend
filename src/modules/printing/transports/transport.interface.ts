import { PrintablePayload } from '../printing.types';

export type TransportChannel = 'rawbt' | 'local_bridge' | 'web_usb' | 'web_bluetooth';

export interface IPrinterTransport {
  readonly channel: TransportChannel;
  sendToPrinter(payload: PrintablePayload): Promise<{ success: boolean; message?: string }>;
}
