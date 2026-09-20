import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware';
import { BillingRepository } from '../billing/billing.repository';
import { AttendanceRepository } from '../attendance/attendance.repository';
import { PdfGenerator } from './pdf.generator';
import { ExcelGenerator } from './excel.generator';

const router = Router();

/**
 * Generate / Stream Customer & Corporate Invoice PDF
 */
router.get(
  '/pdf/invoice/:id',
  requireAuth,
  requireRole(['admin', 'manager', 'staff']),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const invoice = await BillingRepository.getInvoiceById(id);
      if (!invoice) {
        res.status(404).json({ success: false, message: `Invoice ${id} not found` });
        return;
      }

      const pdfBuffer = await PdfGenerator.generateInvoicePdf(invoice);

      // Persist in background to Supabase Storage and register in generated_documents
      PdfGenerator.persistDocument(
        pdfBuffer,
        invoice.invoice_type === 'CORPORATE_CREDIT' ? 'CORPORATE_INVOICE' : 'CUSTOMER_INVOICE',
        invoice.invoice_number,
        invoice.id
      ).catch((err) => console.error('Document persistence error:', err));

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="Invoice-${invoice.invoice_number}.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Generate Corporate Outstanding Statement PDF
 */
router.get(
  '/pdf/statement/:clientId',
  requireAuth,
  requireRole(['admin', 'manager']),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { clientId } = req.params;
      const statement = await BillingRepository.getCorporateStatement(clientId);
      const pdfBuffer = await PdfGenerator.generateStatementPdf(statement);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="Statement-${statement.client?.company_name || clientId}.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Stream Sales Report Excel Workbook
 */
router.get(
  '/excel/sales',
  requireAuth,
  requireRole(['admin', 'manager']),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, clientId, dateFrom, dateTo } = req.query as any;
      const invoices = await BillingRepository.getInvoices({
        status,
        clientId,
        dateFrom,
        dateTo,
        limit: 500
      });

      const excelBuffer = await ExcelGenerator.generateSalesReport(
        invoices,
        dateFrom && dateTo ? `Sales Report (${dateFrom} to ${dateTo})` : 'Sales Report'
      );

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="Chaiwale_Sales_${Date.now()}.xlsx"`);
      res.send(excelBuffer);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * Stream Monthly Staff Attendance Excel Workbook
 */
router.get(
  '/excel/attendance',
  requireAuth,
  requireRole(['admin', 'manager']),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const month = req.query.month ? parseInt(req.query.month as string, 10) : new Date().getMonth() + 1;
      const year = req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear();

      const roster = await AttendanceRepository.getMonthlyRoster(month, year);
      const excelBuffer = await ExcelGenerator.generateAttendanceReport(roster, month, year);

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="Chaiwale_Attendance_${month}_${year}.xlsx"`);
      res.send(excelBuffer);
    } catch (err) {
      next(err);
    }
  }
);

export const documentRoutes = router;
