import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/common.types';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyPrefix?: string;
}

/**
 * Lightweight, zero-dependency Rate Limiter for Express on Vercel / Node.js.
 * 
 * SERVERLESS / VERCEL EXECUTION MODEL NOTICE:
 * In serverless environments (Vercel Functions), memory state is scoped to the
 * active container/lambda instance. While this effectively mitigates rapid-fire
 * bursting and abuse against warm instances, cross-instance distributed rate
 * limiting across multiple concurrent lambdas requires an external key-value
 * store (e.g. Upstash Redis / Redis).
 * Within the current zero-dependency, zero-additional-cost architecture, this
 * provides robust, immediate in-process abuse protection with standard
 * Retry-After and X-RateLimit headers.
 */
class MemoryRateLimiter {
  private store: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Periodic garbage collection of expired tokens every 2 minutes
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 120000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }

  public createMiddleware(options: RateLimitOptions) {
    const { windowMs, max, message, keyPrefix = 'rl' } = options;

    return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
      // Resolve client IP (support Vercel/Cloudflare/reverse-proxy x-forwarded-for)
      const forwarded = req.headers['x-forwarded-for'];
      const rawIp = forwarded
        ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim())
        : (req.ip || req.socket.remoteAddress || '127.0.0.1');

      const key = `${keyPrefix}:${rawIp}`;
      const now = Date.now();

      let record = this.store.get(key);

      if (!record || now > record.resetTime) {
        record = {
          count: 1,
          resetTime: now + windowMs
        };
        this.store.set(key, record);
      } else {
        record.count += 1;
      }

      const remaining = Math.max(0, max - record.count);
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

      if (record.count > max) {
        res.setHeader('Retry-After', retryAfterSec);
        res.status(429).json({
          success: false,
          message: message || 'Too many requests. Please try again later.',
          error: {
            code: 'TOO_MANY_REQUESTS',
            details: { retryAfter: retryAfterSec }
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      next();
    };
  }

  /**
   * Helper: clear stored IP records (used in test suites)
   */
  public resetAll(): void {
    this.store.clear();
  }

  public resetKey(keyPrefix: string, ip: string): void {
    this.store.delete(`${keyPrefix}:${ip}`);
  }
}

export const rateLimiterStore = new MemoryRateLimiter();

/**
 * 1. Public Writes Limiter (Order Creation, Catering Enquiries)
 * Policy: 15 requests per 15 minutes per IP
 */
export const publicWriteRateLimiter = rateLimiterStore.createMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  keyPrefix: 'pub_write',
  message: 'Too many submissions from this connection. Please wait a few minutes before trying again.'
});

/**
 * 2. Authentication Limiter (Operational Staff & Admin Logins)
 * Policy: 10 requests per 15 minutes per IP
 */
export const authRateLimiter = rateLimiterStore.createMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  keyPrefix: 'auth_login',
  message: 'Too many login attempts. For security reasons, please try again in 15 minutes.'
});

/**
 * 3. Public Order Tracking / Search Limiter
 * Policy: 60 requests per minute per IP
 */
export const orderTrackRateLimiter = rateLimiterStore.createMiddleware({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  keyPrefix: 'order_track',
  message: 'Too many tracking requests. Please slow down.'
});
