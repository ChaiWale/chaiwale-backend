import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { getSupabaseAdminClient } from '../../config/supabase.config';
import { BUSINESS_CONFIG } from '../../config/business.config';

export type SupportedDocType =
  | 'CUSTOMER_INVOICE'
  | 'CORPORATE_INVOICE'
  | 'PAYMENT_RECEIPT'
  | 'OUTSTANDING_STATEMENT'
  | 'LEDGER_STATEMENT'
  | 'ATTENDANCE_REPORT';

export class PdfGenerator {
  /**
   * Helper: Resolves verified Chaiwale brand logo image file path
   */
  private static getLogoPath(): string | null {
    const possibleLogoPaths = [
      path.resolve(process.cwd(), 'assets/chaiwale-logo.jpeg'),
      path.resolve(process.cwd(), '../frontend/public/assets/chaiwale-logo.jpeg'),
      path.resolve(__dirname, '../../../assets/chaiwale-logo.jpeg'),
      path.resolve(__dirname, '../../../../frontend/public/assets/chaiwale-logo.jpeg'),
      path.resolve(__dirname, '../../../../assets/chaiwale-logo.jpeg')
    ];
    for (const p of possibleLogoPaths) {
      if (fs.existsSync(p)) return p;
    }
    return null;
  }

  /**
   * Helper: converts PDFKit document stream into a Buffer
   */
  private static async streamToBuffer(doc: InstanceType<typeof PDFDocument>): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));
      doc.end();
    });
  }

  /**
   * Upload generated PDF buffer into Supabase Storage and register in database
   */
  public static async persistDocument(
    pdfBuffer: Buffer,
    docType: SupportedDocType,
    refNumber: string,
    refId?: string
  ): Promise<{ storagePath: string; publicUrl: string }> {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase admin client not initialized.');
    }

    const bucket = docType.includes('INVOICE') ? 'invoices' : 'documents';
    const filename = `${docType.toLowerCase()}_${refNumber}_${Date.now()}.pdf`;
    const storagePath = `${bucket}/${filename}`;

    // 1. Upload to Supabase Storage
    const { error: uploadErr } = await admin.storage
      .from(bucket)
      .upload(filename, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadErr) {
      console.warn(`Warning: Supabase storage upload notice: ${uploadErr.message}`);
    }

    const { data: urlData } = admin.storage.from(bucket).getPublicUrl(filename);
    const publicUrl = urlData?.publicUrl || storagePath;

    // 2. Register in generated_documents table
    await admin.from('generated_documents').insert({
      doc_type: docType,
      reference_id: refId || null,
      reference_number: refNumber,
      storage_path: storagePath
    });

    return { storagePath, publicUrl };
  }

  /**
   * Generate Clean Vector PDF for Customer or Corporate Invoice
   */
  public static async generateInvoicePdf(invoice: any): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    const isCorporate = invoice.invoice_type === 'CORPORATE_CREDIT';
    const isPaid = invoice.status === 'PAID';
    const isPartial = invoice.status === 'PARTIALLY_PAID';

    // Header Branding with Official Logo and Central Business Details
    const logoPath = this.getLogoPath();
    let textX = 40;
    if (logoPath) {
      try {
        doc.image(logoPath, 40, 36, { width: 50, height: 50 });
        textX = 100;
      } catch {
        textX = 40;
      }
    }

    doc
      .fillColor(BUSINESS_CONFIG.colors.primary)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text(BUSINESS_CONFIG.brandName.toUpperCase(), textX, 36);

    doc
      .fillColor(BUSINESS_CONFIG.colors.secondary)
      .fontSize(9)
      .font('Helvetica')
      .text(BUSINESS_CONFIG.tagline, textX, 58)
      .text(BUSINESS_CONFIG.address.full, textX, 70, { width: 440 })
      .text(`Phone: ${BUSINESS_CONFIG.contact.phone} | Email: ${BUSINESS_CONFIG.contact.supportEmail} | Web: ${BUSINESS_CONFIG.urls.website}`, textX, 84);

    doc
      .moveTo(40, 106)
      .lineTo(555, 106)
      .strokeColor('#E2D7CE')
      .lineWidth(1)
      .stroke();

    // Document Title & Number
    doc
      .fillColor('#1A120B')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(isCorporate ? 'INVOICE (CORPORATE)' : 'RETAIL INVOICE', 40, 120);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Invoice No: ${invoice.invoice_number}`, 40, 140)
      .text(`Date: ${new Date(invoice.issued_at || Date.now()).toLocaleDateString('en-IN')}`, 40, 155)
      .text(`Invoice Type: ${invoice.invoice_type}`, 40, 170);

    if (invoice.department) {
      doc.text(`Department: ${invoice.department}`, 40, 180);
    }

    // Status Stamp Box on Right
    const statusColor = isPaid ? '#10B981' : isPartial ? '#F59E0B' : '#EF4444';
    doc
      .rect(420, 115, 135, 30)
      .strokeColor(statusColor)
      .lineWidth(2)
      .stroke();

    doc
      .fillColor(statusColor)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(invoice.status, 420, 124, { width: 135, align: 'center' });

    // Client / Customer Info Box
    const clientY = invoice.department ? 205 : 190;
    doc
      .rect(40, clientY, 515, 60)
      .fillColor('#FAF7F5')
      .fill()
      .strokeColor('#E2D7CE')
      .stroke();

    doc
      .fillColor('#1A120B')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Billed To:', 52, clientY + 10);

    const clientName = invoice.corporate_clients?.company_name || invoice.orders?.customer_name || 'Valued Customer';
    const clientGst = invoice.corporate_clients?.gstin ? `GSTIN: ${invoice.corporate_clients.gstin}` : '';
    const clientAddr = invoice.corporate_clients?.billing_address || invoice.orders?.delivery_address || 'Counter Walk-in';

    doc
      .font('Helvetica')
      .text(clientName, 52, clientY + 24)
      .text(clientAddr, 52, clientY + 38)
      .text(clientGst, 320, clientY + 24);

    // Items Table Header
    const tableTop = clientY + 75;
    doc
      .rect(40, tableTop, 515, 24)
      .fillColor('#6F432A')
      .fill();

    doc
      .fillColor('#FFFFFF')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Item Description', 50, tableTop + 7)
      .text('Rate', 320, tableTop + 7, { width: 60, align: 'right' })
      .text('Qty', 390, tableTop + 7, { width: 50, align: 'center' })
      .text('Amount (Rs.)', 450, tableTop + 7, { width: 95, align: 'right' });

    // Line Items
    let currentY = tableTop + 24;
    const items = invoice.orders?.order_items || [
      { item_name: 'Special Masala Chai & Refreshments', unit_price: invoice.subtotal, quantity: 1, line_total: invoice.subtotal }
    ];

    doc.font('Helvetica').fontSize(9).fillColor('#1A120B');

    items.forEach((it: any, index: number) => {
      const bgColor = index % 2 === 0 ? '#FFFFFF' : '#FDFCFA';
      doc.rect(40, currentY, 515, 20).fillColor(bgColor).fill();

      doc
        .fillColor('#1A120B')
        .text(it.item_name, 50, currentY + 5)
        .text(Number(it.unit_price).toFixed(2), 320, currentY + 5, { width: 60, align: 'right' })
        .text(String(it.quantity), 390, currentY + 5, { width: 50, align: 'center' })
        .text(Number(it.line_total).toFixed(2), 450, currentY + 5, { width: 95, align: 'right' });

      currentY += 20;
    });

    // Subtotal & Financial Summary
    currentY += 10;
    doc
      .moveTo(320, currentY)
      .lineTo(555, currentY)
      .strokeColor('#E2D7CE')
      .stroke();

    currentY += 8;
    const renderSummaryLine = (label: string, value: number, isBold = false, color = '#1A120B') => {
      doc
        .font(isBold ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(isBold ? 11 : 9)
        .fillColor(color)
        .text(label, 320, currentY, { width: 120, align: 'left' })
        .text(`Rs. ${value.toFixed(2)}`, 450, currentY, { width: 95, align: 'right' });
      currentY += 16;
    };

    renderSummaryLine('Subtotal', Number(invoice.subtotal));
    if (Number(invoice.tax_amount) > 0) {
      renderSummaryLine('GST', Number(invoice.tax_amount));
    }
    if (invoice.discount_amount && Number(invoice.discount_amount) > 0) {
      renderSummaryLine('Discount', -Number(invoice.discount_amount), false, '#10B981');
    }
    renderSummaryLine('Grand Total', Number(invoice.grand_total), true, '#6F432A');
    renderSummaryLine('Amount Paid', Number(invoice.paid_amount || 0), false, '#10B981');
    renderSummaryLine('Balance Outstanding', Number(invoice.outstanding_amount || 0), true, '#EF4444');

    // Footer
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#8A7366')
      .text('This is a computer-generated invoice and requires no signature.', 40, 750, { align: 'center', width: 515 })
      .text('Chaiwale - Delivering Hot Authentic Chai Across Delhi NCR', 40, 765, { align: 'center', width: 515 });

    return this.streamToBuffer(doc);
  }

  /**
   * Generate Payment Receipt PDF
   */
  public static async generateReceiptPdf(payment: any): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 40, size: 'A5' });

    const logoPath = this.getLogoPath();
    let textX = 40;
    if (logoPath) {
      try {
        doc.image(logoPath, 40, 26, { width: 38, height: 38 });
        textX = 88;
      } catch {
        textX = 40;
      }
    }

    doc
      .fillColor(BUSINESS_CONFIG.colors.primary)
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(BUSINESS_CONFIG.brandName.toUpperCase(), textX, 26);

    doc
      .fillColor(BUSINESS_CONFIG.colors.secondary)
      .fontSize(8)
      .font('Helvetica')
      .text('OFFICIAL PAYMENT RECEIPT', textX, 46)
      .text(`${BUSINESS_CONFIG.address.locality}, ${BUSINESS_CONFIG.address.city} | ${BUSINESS_CONFIG.contact.phone}`, textX, 56);

    doc.moveTo(40, 72).lineTo(380, 72).strokeColor('#E2D7CE').stroke();

    doc
      .fillColor('#1A120B')
      .fontSize(10)
      .font('Helvetica')
      .text(`Receipt ID: ${payment.id || 'REC-' + Date.now().toString().slice(-6)}`, 40, 85)
      .text(`Date: ${new Date(payment.paid_at || Date.now()).toLocaleDateString('en-IN')}`, 40, 100)
      .text(`Payment Mode: ${payment.payment_mode}`, 40, 115);

    if (payment.transaction_ref) {
      doc.text(`UTR / Reference: ${payment.transaction_ref}`, 40, 130);
    }

    doc
      .rect(40, 160, 340, 50)
      .fillColor('#F4EFEA')
      .fill()
      .strokeColor('#D7C4B7')
      .stroke();

    doc
      .fillColor('#6F432A')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('AMOUNT RECEIVED', 55, 172)
      .fontSize(16)
      .text(`Rs. ${Number(payment.amount).toFixed(2)}`, 230, 170, { width: 135, align: 'right' });

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#8A7366')
      .text('Thank you for your payment!', 40, 240, { align: 'center', width: 340 });

    return this.streamToBuffer(doc);
  }

  /**
   * Generate Corporate Client Outstanding Statement PDF
   */
  public static async generateStatementPdf(statement: any): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    const logoPath = this.getLogoPath();
    let textX = 40;
    if (logoPath) {
      try {
        doc.image(logoPath, 40, 36, { width: 44, height: 44 });
        textX = 95;
      } catch {
        textX = 40;
      }
    }

    doc
      .fillColor(BUSINESS_CONFIG.colors.primary)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text(BUSINESS_CONFIG.brandName.toUpperCase(), textX, 36)
      .fontSize(11)
      .fillColor('#1A120B')
      .text('STATEMENT OF ACCOUNT', textX, 60);

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(BUSINESS_CONFIG.colors.secondary)
      .text(`${BUSINESS_CONFIG.address.full} | ${BUSINESS_CONFIG.contact.phone}`, textX, 74)
      .text(`Company: ${statement.client?.company_name}`, 40, 96)
      .text(`GSTIN: ${statement.client?.gstin || 'N/A'}`, 40, 110)
      .text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 40, 124);

    // Summary Box
    doc.rect(40, 140, 515, 45).fillColor('#FAF7F5').fill().strokeColor('#E2D7CE').stroke();
    doc
      .fillColor('#6F432A')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(`Total Invoiced: Rs. ${statement.totalInvoiced}`, 55, 155)
      .text(`Total Paid: Rs. ${statement.totalPaid}`, 220, 155)
      .fillColor('#EF4444')
      .text(`Outstanding Balance: Rs. ${statement.totalOutstanding}`, 370, 155);

    return this.streamToBuffer(doc);
  }
}
