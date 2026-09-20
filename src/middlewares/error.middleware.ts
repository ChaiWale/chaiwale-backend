import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/common.types';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
): void => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const isProd = process.env.NODE_ENV === 'production';

  // In production, mask unexpected 500 errors so database schema, SQL errors, or internal paths are never exposed
  const safeMessage = (isProd && statusCode === 500)
    ? 'An unexpected error occurred. Please try again later.'
    : (err.message || 'Internal Server Error');

  // Server-side log without leaking secrets
  if (statusCode === 500) {
    console.error(`[SERVER ERROR] ${new Date().toISOString()}: ${err.message}`);
    if (!isProd && err.stack) {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
    error: {
      code: 'INTERNAL_ERROR',
      details: !isProd ? err.stack : undefined
    },
    timestamp: new Date().toISOString()
  });
};
