import { Request, Response, NextFunction } from 'express';
import { BillingService } from './billing.service';
import { ApiResponse } from '../../types/common.types';
import { BillingCalculationInput } from './billing.types';

export class BillingController {
  public static async healthCheck(_req: Request, res: Response<ApiResponse>): Promise<void> {
    res.json({
      success: true,
      message: 'Central Billing Engine initialized (Live Supabase Persistence Layer)',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Authoritative calculation of totals called by frontend / POS
   */
  public static calculateTotals(req: Request, res: Response<ApiResponse>, next: NextFunction): void {
    try {
      const input = req.body as BillingCalculationInput;
      if (!input || !Array.isArray(input.items)) {
        res.status(400).json({
          success: false,
          message: 'Invalid billing input: items array is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = BillingService.calculateBillTotals(input);
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Generate verified invoice and persist in Supabase
   */
  public static async generateInvoice(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const corporateClientId = req.body.corporateClientId || req.body.clientId;
      const {
        orderId,
        cateringQuoteId,
        invoiceType,
        department,
        customerName,
        customerPhone,
        issueDate,
        items,
        overallDiscountPercent,
        additionalCharges,
        paymentMode,
        transactionRef
      } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({
          success: false,
          message: 'At least one item is required to generate an invoice',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await BillingService.generateInvoice({
        orderId,
        corporateClientId,
        cateringQuoteId,
        invoiceType: invoiceType || 'DIRECT',
        department,
        customerName,
        customerPhone,
        issueDate,
        items,
        overallDiscountPercent: overallDiscountPercent ? Number(overallDiscountPercent) : undefined,
        additionalCharges: additionalCharges ? Number(additionalCharges) : undefined,
        paymentMode: paymentMode || 'CASH',
        transactionRef
      });

      res.status(201).json({
        success: true,
        message: 'Invoice created successfully in database',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Record payment (full or partial) against an invoice
   */
  public static async recordPayment(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { invoiceId, amount, paymentMode, transactionRef, notes } = req.body;

      if (!invoiceId) {
        res.status(400).json({
          success: false,
          message: 'Invoice ID is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (amount === undefined || Number(amount) <= 0) {
        res.status(400).json({
          success: false,
          message: 'Payment amount must be greater than 0',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await BillingService.recordPayment({
        invoiceId,
        amount: Number(amount),
        paymentMode: paymentMode || 'CASH',
        transactionRef,
        notes
      });

      res.json({
        success: true,
        message: `Payment of ₹${amount} recorded successfully. Invoice status: ${result.status}`,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      if (err.message && err.message.includes('exceeds invoice outstanding')) {
        res.status(400).json({
          success: false,
          message: err.message,
          timestamp: new Date().toISOString()
        });
        return;
      }
      next(err);
    }
  }

  public static async getInvoices(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const rawLimit = req.query.limit || req.query.pageSize;
      const parsedLimit = rawLimit ? parseInt(rawLimit as string, 10) : 50;
      const limit = isNaN(parsedLimit) ? 50 : Math.min(Math.max(1, parsedLimit), 100);
      const status = req.query.status as any;
      const clientId = req.query.clientId as string | undefined;
      const dateFrom = req.query.dateFrom as string | undefined;
      const dateTo = req.query.dateTo as string | undefined;

      const invoices = await BillingService.getInvoices({
        limit,
        status,
        clientId,
        dateFrom,
        dateTo
      });

      res.json({
        success: true,
        data: invoices,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getInvoiceById(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const invoice = await BillingService.getInvoiceById(id);
      if (!invoice) {
        res.status(404).json({
          success: false,
          message: `Invoice ${id} not found`,
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.json({
        success: true,
        data: invoice,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getLedger(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const clientId = req.query.clientId as string | undefined;
      const rawLimit = req.query.limit || req.query.pageSize;
      const parsedLimit = rawLimit ? parseInt(rawLimit as string, 10) : 50;
      const limit = isNaN(parsedLimit) ? 50 : Math.min(Math.max(1, parsedLimit), 100);
      const ledger = await BillingService.getLedger(clientId, limit);
      res.json({
        success: true,
        data: ledger,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getCorporateStatement(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { clientId } = req.params;
      const statement = await BillingService.getCorporateStatement(clientId);
      res.json({
        success: true,
        data: statement,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteInvoice(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Invoice ID is required',
          timestamp: new Date().toISOString()
        });
        return;
      }
      await BillingService.deleteInvoice(id);
      res.json({
        success: true,
        message: `Invoice '${id}' and linked order deleted successfully`,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getCustomerBills(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const phone = (req.query.phone as string) || '';
      const pin = (req.query.pin as string) || undefined;

      if (!phone || phone.trim().replace(/\D/g, '').length < 7) {
        res.status(400).json({
          success: false,
          message: 'Valid phone number is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await BillingService.getCustomerInvoices(phone, pin);
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

