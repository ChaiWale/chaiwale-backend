import { Request, Response, NextFunction } from 'express';
import { AttendanceService } from './attendance.service';
import { ApiResponse } from '../../types/common.types';

export class AttendanceController {
  public static async healthCheck(_req: Request, res: Response<ApiResponse>): Promise<void> {
    res.json({
      success: true,
      message: 'Attendance module initialized (Phase 3 Supabase Register Layer)',
      timestamp: new Date().toISOString()
    });
  }

  public static async saveRoster(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const records = req.body.records;
      if (!Array.isArray(records)) {
        res.status(400).json({
          success: false,
          message: 'records array is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      await AttendanceService.markAttendance(records);
      res.json({
        success: true,
        message: 'Attendance saved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getRoster(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const month = Number(req.query.month) || new Date().getMonth() + 1;
      const year = Number(req.query.year) || new Date().getFullYear();

      const data = await AttendanceService.getMonthlyRoster(month, year);
      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}
