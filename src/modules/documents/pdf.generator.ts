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

    const clientName =
      invoice.corporate_clients?.company_name ||
      invoice.orders?.customers?.name ||
      invoice.orders?.customer_name ||
      invoice.department ||
      'Valued Customer';
    const clientGst = invoice.corporate_clients?.gstin ? `GSTIN: ${invoice.corporate_clients.gstin}` : '';
    const clientAddr =
      invoice.corporate_clients?.billing_address ||
      invoice.orders?.delivery_address ||
      invoice.orders?.customers?.phone ||
      (invoice.department ? invoice.department : 'Counter Walk-in');

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
    const items = (invoice.orders?.order_items && invoice.orders.order_items.length > 0)
      ? invoice.orders.order_items
      : (invoice.line_items || invoice.items || [
          { item_name: 'Special Masala Chai & Refreshments', unit_price: invoice.subtotal, quantity: 1, line_total: invoice.subtotal }
        ]);

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

  /**
   * Helper to strip emoji and unicode characters that PDFKit built-in fonts cannot render
   */
  private static cleanPdfText(val: any): string {
    if (val === null || val === undefined) return '';
    const str = String(val);
    return str
      .replace(/₹/g, 'Rs. ')
      .replace(/•/g, '-')
      // Strip emojis and non-printable unicode glyphs
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F2FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '')
      .replace(/[^\x20-\x7E\r\n\t]/g, '')
      .trim();
  }

  /**
   * Helper: Resolves verified Chaiwale brand UPI QR code image file path
   */
  private static getUpiQrPath(): string | null {
    const possibleQrPaths = [
      path.resolve(process.cwd(), 'assets/chaiwale-upi-qr.jpeg'),
      path.resolve(process.cwd(), '../billbook/public/assets/chaiwale-upi-qr.jpeg'),
      path.resolve(__dirname, '../../../assets/chaiwale-upi-qr.jpeg'),
      path.resolve(__dirname, '../../../../billbook/public/assets/chaiwale-upi-qr.jpeg'),
      path.resolve(__dirname, '../../../../assets/chaiwale-upi-qr.jpeg')
    ];
    for (const p of possibleQrPaths) {
      if (fs.existsSync(p)) return p;
    }
    return null;
  }

  /**
   * Generate Full Date-wise Khata Bill & Account Statement PDF for Customer
   */
  public static async generateKhataStatementPdf(
    statement: {
      office: {
        id: string;
        name: string;
        company_name?: string;
        phone?: string;
        floor_unit?: string;
        client_pin?: string;
      };
      dateGroups: {
        date: string;
        items: {
          item_name: string;
          quantity: number;
          unit_price: number;
          total_amount: number;
        }[];
        dateTotal: number;
      }[];
      payments: {
        date: string;
        amount: number;
        payment_mode: string;
        notes?: string;
      }[];
      totalConsumption: number;
      totalPayments: number;
      balanceDue: number;
    },
    options?: {
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });

    const logoPath = this.getLogoPath();
    let textX = 40;
    if (logoPath) {
      try {
        doc.image(logoPath, 40, 32, { width: 46, height: 46 });
        textX = 98;
      } catch {
        textX = 40;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // Header Branding (Spaced without overlap)
    // ─────────────────────────────────────────────────────────────
    doc
      .fillColor(BUSINESS_CONFIG.colors.primary)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text(BUSINESS_CONFIG.brandName.toUpperCase(), textX, 30);

    doc
      .fontSize(10.5)
      .font('Helvetica-Bold')
      .fillColor('#1E293B')
      .text('OFFICIAL KHATA BILL & ACCOUNT STATEMENT', textX, 56);

    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(BUSINESS_CONFIG.colors.secondary)
      .text('Vardhman Grand Plaza, Rohini, New Delhi | Phone: +91 93101 12564 | Web: chaiwale.co.in', textX, 72, { width: 450 })
      .text('Email: support@chaiwale.co.in | Store Lead: Sunil Kumar', textX, 84, { width: 450 });

    // Decorative header line
    doc.moveTo(40, 102).lineTo(555, 102).strokeColor('#E2D7CE').lineWidth(1.5).stroke();

    // ─────────────────────────────────────────────────────────────
    // Customer & Period Details Card (Two distinct non-overlapping columns)
    // ─────────────────────────────────────────────────────────────
    let curY = 112;
    const cardHeight = 74;
    doc.rect(40, curY, 515, cardHeight).fillColor('#F8FAFC').fill().strokeColor('#CBD5E1').lineWidth(1).stroke();

    const rangeLabel = options?.startDate && options?.endDate
      ? `${options.startDate} to ${options.endDate}`
      : options?.startDate
      ? `From ${options.startDate}`
      : 'All Recorded Transactions';

    // Left Column: Customer Info (Strict width 250px)
    doc.fillColor('#64748B').fontSize(8).font('Helvetica-Bold').text('CUSTOMER / OFFICE DETAILS', 52, curY + 8, { width: 250 });
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#C85A17').text(this.cleanPdfText(statement.office.name), 52, curY + 20, { width: 250, ellipsis: true });

    const locationText = [statement.office.company_name, statement.office.floor_unit].filter(Boolean).join(', ') || 'Gurgaon Counter Khata';
    doc.fontSize(8.5).font('Helvetica').fillColor('#334155')
      .text(`Location: ${this.cleanPdfText(locationText)}`, 52, curY + 36, { width: 250, height: 16, ellipsis: true })
      .text(`Phone: ${this.cleanPdfText(statement.office.phone || 'N/A')}`, 52, curY + 52, { width: 250 });

    // Center Vertical Line inside card
    doc.moveTo(310, curY + 6).lineTo(310, curY + cardHeight - 6).strokeColor('#E2E8F0').lineWidth(1).stroke();

    // Right Column: Statement Meta & 4-digit PIN (Strict X 325px, width 220px)
    doc.fillColor('#64748B').fontSize(8).font('Helvetica-Bold').text('STATEMENT METADATA', 325, curY + 8, { width: 220 });

    doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#1E293B').text('Period:', 325, curY + 22);
    doc.fontSize(8.5).font('Helvetica').fillColor('#334155').text(this.cleanPdfText(rangeLabel), 415, curY + 22, { width: 130 });

    doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#1E293B').text('Generated Date:', 325, curY + 37);
    doc.fontSize(8.5).font('Helvetica').fillColor('#334155').text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), 415, curY + 37, { width: 130 });

    doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#1E293B').text('Khata Portal PIN:', 325, curY + 52);
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#2563EB').text(this.cleanPdfText(statement.office.client_pin || '----'), 415, curY + 51, { width: 130 });

    // ─────────────────────────────────────────────────────────────
    // Summary Highlight Banner (Consumption vs Paid vs Net Overdue)
    // ─────────────────────────────────────────────────────────────
    curY += cardHeight + 10;
    doc.rect(40, curY, 515, 48).fillColor('#FAF7F5').fill().strokeColor('#E2D7CE').stroke();

    // Box 1: Total Consumption
    doc.fillColor('#64748B').fontSize(8.5).font('Helvetica-Bold').text('TOTAL CONSUMPTION', 55, curY + 10);
    doc.fillColor('#0F172A').fontSize(13).font('Helvetica-Bold').text(`Rs. ${statement.totalConsumption.toFixed(2)}`, 55, curY + 24);

    // Box 2: Total Paid
    doc.fillColor('#64748B').fontSize(8.5).font('Helvetica-Bold').text('TOTAL PAID', 230, curY + 10);
    doc.fillColor('#16A34A').fontSize(13).font('Helvetica-Bold').text(`Rs. ${statement.totalPayments.toFixed(2)}`, 230, curY + 24);

    // Box 3: Net Overdue
    const isOverdue = statement.balanceDue > 0;
    doc.fillColor(isOverdue ? '#DC2626' : '#16A34A').fontSize(8.5).font('Helvetica-Bold').text(isOverdue ? 'NET OVERDUE BALANCE' : 'KHATA BALANCE', 390, curY + 10);
    doc.fillColor(isOverdue ? '#DC2626' : '#16A34A').fontSize(14).font('Helvetica-Bold').text(`Rs. ${statement.balanceDue.toFixed(2)}`, 390, curY + 24);

    curY += 58;

    // ─────────────────────────────────────────────────────────────
    // Table 1: Daily Date-wise Consumption Breakdown
    // ─────────────────────────────────────────────────────────────
    const checkPageOverflow = (neededHeight: number) => {
      if (curY + neededHeight > 750) {
        doc.addPage();
        curY = 45;
      }
    };

    checkPageOverflow(50);
    doc.fillColor('#0F172A').fontSize(11).font('Helvetica-Bold').text('Date-wise Item Consumption Breakdown:', 40, curY);
    curY += 16;

    // Table Header
    doc.rect(40, curY, 515, 20).fillColor('#6F432A').fill();
    doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold')
      .text('Item Description (Food, Tea, Drinks, Tobacco)', 50, curY + 5)
      .text('Rate (Rs.)', 330, curY + 5, { width: 60, align: 'right' })
      .text('Qty', 410, curY + 5, { width: 40, align: 'center' })
      .text('Amount (Rs.)', 465, curY + 5, { width: 80, align: 'right' });
    curY += 20;

    if (statement.dateGroups.length === 0) {
      doc.rect(40, curY, 515, 24).fillColor('#FFFFFF').fill().strokeColor('#E2E8F0').stroke();
      doc.fillColor('#64748B').fontSize(9).font('Helvetica').text('No consumption entries recorded for this period.', 50, curY + 7);
      curY += 28;
    } else {
      statement.dateGroups.forEach((dg) => {
        checkPageOverflow(30 + dg.items.length * 18);

        // Date Group Bar (Clean ASCII Date)
        doc.rect(40, curY, 515, 18).fillColor('#FEF3C7').fill().strokeColor('#FDE68A').stroke();
        doc.fillColor('#92400E').fontSize(9).font('Helvetica-Bold')
          .text(`Date: ${this.cleanPdfText(dg.date)}`, 48, curY + 4)
          .text(`Day Total: Rs. ${dg.dateTotal.toFixed(2)}`, 425, curY + 4, { width: 120, align: 'right' });
        curY += 18;

        // Items in this date
        dg.items.forEach((it, idx) => {
          checkPageOverflow(20);
          const bg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
          doc.rect(40, curY, 515, 17).fillColor(bg).fill();

          doc.fillColor('#1E293B').fontSize(8.5).font('Helvetica')
            .text(this.cleanPdfText(it.item_name), 56, curY + 4, { width: 270, ellipsis: true })
            .text(`${Number(it.unit_price).toFixed(2)}`, 330, curY + 4, { width: 60, align: 'right' })
            .text(String(it.quantity), 410, curY + 4, { width: 40, align: 'center' })
            .text(`${Number(it.total_amount).toFixed(2)}`, 465, curY + 4, { width: 80, align: 'right' });

          curY += 17;
        });
      });
    }

    // ─────────────────────────────────────────────────────────────
    // Table 2: Payments History
    // ─────────────────────────────────────────────────────────────
    if (statement.payments.length > 0) {
      curY += 12;
      checkPageOverflow(50 + statement.payments.length * 18);

      doc.fillColor('#0F172A').fontSize(11).font('Helvetica-Bold').text('Payments & Settlements Received:', 40, curY);
      curY += 16;

      doc.rect(40, curY, 515, 20).fillColor('#15803D').fill();
      doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold')
        .text('Date', 50, curY + 5)
        .text('Payment Mode', 140, curY + 5)
        .text('Transaction Details / Reference', 240, curY + 5)
        .text('Amount Paid (Rs.)', 445, curY + 5, { width: 100, align: 'right' });
      curY += 20;

      statement.payments.forEach((p, idx) => {
        checkPageOverflow(20);
        const bg = idx % 2 === 0 ? '#FFFFFF' : '#F0FDF4';
        doc.rect(40, curY, 515, 18).fillColor(bg).fill();

        doc.fillColor('#1E293B').fontSize(8.5).font('Helvetica')
          .text(this.cleanPdfText(p.date), 50, curY + 4)
          .text(this.cleanPdfText(p.payment_mode), 140, curY + 4)
          .text(this.cleanPdfText(p.notes || 'Khata Payment Settlement'), 240, curY + 4, { width: 200, ellipsis: true })
          .fillColor('#15803D').font('Helvetica-Bold')
          .text(`Rs. ${Number(p.amount).toFixed(2)}`, 445, curY + 4, { width: 100, align: 'right' });

        curY += 18;
      });
    }

    // ─────────────────────────────────────────────────────────────
    // Payment Instructions (English) & Real Chaiwale UPI QR Code
    // ─────────────────────────────────────────────────────────────
    checkPageOverflow(95);
    curY += 14;

    const upiQrPath = this.getUpiQrPath();
    const payBoxHeight = upiQrPath ? 72 : 62;

    doc.rect(40, curY, 515, payBoxHeight).fillColor('#FFFBEB').fill().strokeColor('#FDE68A').stroke();
    doc.fillColor('#92400E').fontSize(9.5).font('Helvetica-Bold').text('Payment Instructions & Account Verification:', 50, curY + 7);

    const textWidth = upiQrPath ? 415 : 500;
    doc.fillColor('#78350F').fontSize(8.5).font('Helvetica')
      .text('- Please settle your outstanding balance via UPI / QR scan or Cash at the counter.', 50, curY + 20, { width: textWidth })
      .text(`- Verified Chaiwale UPI: chaiwale@ptyes | Contact Lead: +91 93101 12564`, 50, curY + 32, { width: textWidth })
      .text(`- Customer Portal: Check live statement anytime at https://chaiwale.co.in/check-bill (PIN: ${this.cleanPdfText(statement.office.client_pin || '----')})`, 50, curY + 44, { width: textWidth })
      .text('- For any discrepancy or query, please contact store lead: +91 93101 12564', 50, curY + 56, { width: textWidth });

    // Render Genuine Chaiwale UPI QR image on the right
    if (upiQrPath) {
      try {
        doc.image(upiQrPath, 474, curY + 6, { width: 56, height: 56 });
        doc.fontSize(7).font('Helvetica-Bold').fillColor('#92400E').text('SCAN TO PAY', 466, curY + 63, { width: 72, align: 'center' });
      } catch {
        // Safe fallback if image decoding has an issue
      }
    }

    curY += payBoxHeight + 10;
    doc.fontSize(8).font('Helvetica').fillColor('#94A3B8')
      .text('This is an official computer-generated account bill from Chaiwale. No signature required.', 40, curY, { align: 'center', width: 515 });

    return this.streamToBuffer(doc);
  }
}


