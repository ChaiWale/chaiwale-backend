import { Request, Response, NextFunction } from 'express';
import { CateringService } from './catering.service';
import { ApiResponse } from '../../types/common.types';

export class CateringController {
  public static async healthCheck(_req: Request, res: Response<ApiResponse>): Promise<void> {
    res.json({
      success: true,
      message: 'Catering module initialized (Live Supabase Persistence Layer)',
      timestamp: new Date().toISOString()
    });
  }

  public static async submitEnquiry(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { customerName, phone, email, companyName, serviceType, headcount, eventDate, requirements } = req.body;

      if (!customerName || !phone || !headcount) {
        res.status(400).json({
          success: false,
          message: 'Customer name, phone, and headcount are required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await CateringService.submitEnquiry({
        customerName,
        phone,
        email,
        companyName,
        serviceType: serviceType || 'OFFICE_LUNCH',
        headcount: Number(headcount),
        eventDate,
        requirements
      });

      res.status(201).json({
        success: true,
        message: 'Catering enquiry submitted and saved in database',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getLeads(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const rawLimit = req.query.limit || req.query.pageSize;
      const parsedLimit = rawLimit ? parseInt(rawLimit as string, 10) : 25;
      const limit = isNaN(parsedLimit) ? 25 : Math.min(Math.max(1, parsedLimit), 100);
      const leads = await CateringService.getLeads(limit);
      res.json({
        success: true,
        data: leads,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async updateLeadStatus(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        res.status(400).json({
          success: false,
          message: 'Status is required',
          timestamp: new Date().toISOString()
        });
        return;
      }
      await CateringService.updateLeadStatus(id, status);
      res.json({
        success: true,
        message: `Catering lead status updated to ${status.toUpperCase()} in database`,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async recordAdvancePayment(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { amount, paymentMode, transactionRef } = req.body;

      if (!amount || Number(amount) <= 0) {
        res.status(400).json({
          success: false,
          message: 'Advance amount must be greater than 0',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await CateringService.recordAdvancePayment(
        id,
        Number(amount),
        paymentMode || 'UPI',
        transactionRef
      );

      res.json({
        success: true,
        message: `Advance payment of ₹${amount} recorded and credited to ledger`,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}
