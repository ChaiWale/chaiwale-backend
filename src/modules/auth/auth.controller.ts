import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../types/common.types';

export class AuthController {
  public static async healthCheck(_req: Request, res: Response<ApiResponse>): Promise<void> {
    res.json({
      success: true,
      message: 'Auth module initialized (Phase 5A Supabase Auth + RBAC)',
      timestamp: new Date().toISOString()
    });
  }

  public static async login(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required.',
          error: { code: 'VALIDATION_ERROR' },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await AuthService.login(email, password);

      res.json({
        success: true,
        message: 'Authentication successful.',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(401).json({
        success: false,
        message: err.message || 'Authentication failed.',
        error: { code: 'UNAUTHORIZED' },
        timestamp: new Date().toISOString()
      });
    }
  }

  public static async getMe(req: Request, res: Response<ApiResponse>): Promise<void> {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated.',
        error: { code: 'UNAUTHORIZED' },
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.json({
      success: true,
      data: req.user,
      timestamp: new Date().toISOString()
    });
  }
}
