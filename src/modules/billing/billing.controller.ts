import { Request, Response, NextFunction } from 'express';
import { BillingService } from './billing.service';
import { ApiResponse } from '../../types/common.types';
import { BillingCalculationInput } from './billing.types';
import { getSupabaseAdminClient } from '../../config/supabase.config';

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
        customerEmail,
        issueDate,
        items,
        overallDiscountPercent,
        additionalCharges,
        paymentMode,
        transactionRef
      } = req.body;

      const effectiveEmail = customerEmail || req.body.email || req.body.guestEmail;

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
        customerEmail: effectiveEmail,
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

  /**
   * Public Invoice Verification & Lookup (chaiwale.co.in/invoice/:id)
   */
  public static async getPublicInvoice(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const phoneInput = ((req.body?.phone || req.query?.phone || '') as string).trim();
      const pinInput = ((req.body?.pin || req.query?.pin || '') as string).trim();

      const invoice = await BillingService.getInvoiceById(id);
      if (!invoice) {
        res.status(404).json({
          success: false,
          message: `Invoice '${id}' was not found. Please verify the invoice number.`,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Collect all authorized phones and PINs for this invoice
      const cleanInputPhone = phoneInput.replace(/[\s\-]/g, '').replace(/^\+91/, '').replace(/^91/, '').slice(-10);
      const cleanInputPin = pinInput.toUpperCase();

      // Check linked Khata Office
      let office: any = null;
      if (invoice.corporate_client_id) {
        const supabase = getSupabaseAdminClient();
        if (supabase) {
          const { data } = await supabase.from('khata_offices').select('*').eq('id', invoice.corporate_client_id).maybeSingle();
          office = data;
        }
      }

      // Check linked Order customer
      const orderCustomerPhone = (invoice.orders?.customers?.phone || '').replace(/\D/g, '').slice(-10);
      const deliveryAddress = invoice.orders?.delivery_address || '';
      const department = invoice.department || '';

      // Check if phone or PIN matches
      let isVerified = false;

      // 1. PIN match
      if (cleanInputPin && office?.client_pin && cleanInputPin === office.client_pin.trim().toUpperCase()) {
        isVerified = true;
      }

      // 2. Phone match
      if (cleanInputPhone && cleanInputPhone.length >= 7) {
        if (office?.phone && office.phone.replace(/\D/g, '').endsWith(cleanInputPhone)) {
          isVerified = true;
        } else if (orderCustomerPhone && orderCustomerPhone.endsWith(cleanInputPhone)) {
          isVerified = true;
        } else if (deliveryAddress.includes(cleanInputPhone) || department.includes(cleanInputPhone)) {
          isVerified = true;
        }
      }

      // Masked hint for UI
      const rawPhone = office?.phone || orderCustomerPhone || (deliveryAddress.match(/\d{10}/)?.[0]) || (department.match(/\d{10}/)?.[0]) || '';
      const maskedPhone = rawPhone.length >= 10
        ? `${rawPhone.slice(0, 2)}******${rawPhone.slice(-2)}`
        : undefined;

      if (!isVerified) {
        // If credentials were provided but didn't match:
        if (cleanInputPhone || cleanInputPin) {
          res.status(401).json({
            success: false,
            message: 'Entered Mobile Number or PIN does not match this invoice.',
            data: {
              invoiceNumber: invoice.invoice_number,
              requiresAuth: true,
              maskedPhone
            },
            timestamp: new Date().toISOString()
          });
          return;
        }

        // No credentials provided yet -> Prompt verification
        res.json({
          success: true,
          data: {
            invoiceNumber: invoice.invoice_number,
            requiresAuth: true,
            maskedPhone,
            issuedAt: invoice.issued_at
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verified! Return complete invoice data for customer display
      res.json({
        success: true,
        data: {
          verified: true,
          invoice: {
            id: invoice.id,
            invoiceNumber: invoice.invoice_number,
            invoiceType: invoice.invoice_type,
            status: invoice.status,
            issuedAt: invoice.issued_at,
            customerName: office?.name || invoice.orders?.customers?.name || 'Valued Guest',
            companyName: office?.company_name || invoice.corporate_clients?.company_name || undefined,
            phone: office?.phone || orderCustomerPhone || undefined,
            clientPin: office?.client_pin || undefined,
            paymentMode: invoice.orders?.payment_mode || 'PAID',
            subtotal: invoice.subtotal,
            taxAmount: invoice.tax_amount,
            discountAmount: invoice.discount_amount,
            grandTotal: invoice.grand_total,
            paidAmount: invoice.paid_amount,
            outstandingAmount: invoice.outstanding_amount,
            items: (invoice.orders?.order_items || []).map((it: any) => ({
              name: it.item_name,
              quantity: it.quantity,
              unitPrice: it.unit_price,
              lineTotal: it.line_total
            }))
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}

