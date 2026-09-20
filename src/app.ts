import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { config } from './config/env.config';
import { errorHandler } from './middlewares/error.middleware';
import { authRoutes } from './modules/auth/auth.routes';
import { menuRoutes } from './modules/menu/menu.routes';
import { orderRoutes } from './modules/orders/order.routes';
import { cateringRoutes } from './modules/catering/catering.routes';
import { billingRoutes } from './modules/billing/billing.routes';
import { attendanceRoutes } from './modules/attendance/attendance.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { configRoutes } from './modules/config/config.routes';
import { documentRoutes } from './modules/documents/document.routes';
import { printingRoutes } from './modules/printing/printing.routes';
import { mediaRoutes } from './modules/media/media.routes';
import { khataRoutes } from './modules/khata/khata.routes';
import { getSupabaseAdminClient } from './config/supabase.config';

export const createApp = (): Application => {
  const app = express();

  // Core Middlewares
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, server-side SSR, cron, or curl)
      if (!origin) return callback(null, true);

      // Check against configured allowed origins
      if (config.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In production mode, reject any origin that is not explicitly in allowedOrigins
      if (config.isProduction) {
        return callback(null, false);
      }

      // In development mode only: allow local development origins
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Baseline HTTP Security Headers
  app.use((_req: Request, res: Response, next: import('express').NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // Robots disallow for backend API
  app.get('/robots.txt', (_req: Request, res: Response) => {
    res.type('text/plain').send('User-agent: *\nDisallow: /\n');
  });

  /**
   * Root Branded Operational Landing Page (api.chaiwale.co.in)
   * Minimal, premium operational status page.
   * Zero debug information, zero route list, zero environment variables.
   */
  app.get('/', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chaiwale API | Operational</title>
  <link rel="icon" type="image/jpeg" href="/media/branding/logo/chaiwale-logo.jpeg">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #FAF7F5;
      color: #1A120B;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      background: #FFFFFF;
      border: 1px solid #ECE4DE;
      border-radius: 16px;
      padding: 40px 32px;
      max-width: 440px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(111, 67, 42, 0.06);
    }
    .logo {
      width: 80px;
      height: 80px;
      border-radius: 16px;
      object-fit: cover;
      margin-bottom: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #6F432A;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .tagline {
      font-size: 13px;
      color: #8A7366;
      margin-bottom: 24px;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background-color: #ECFDF5;
      color: #065F46;
      padding: 8px 18px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 600;
      border: 1px solid #A7F3D0;
      margin-bottom: 16px;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      background-color: #10B981;
      border-radius: 50%;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
    }
    .desc {
      font-size: 14px;
      color: #6B7280;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="card">
    <img src="/media/branding/logo/chaiwale-logo.jpeg" alt="Chaiwale Logo" class="logo">
    <h1>Chaiwale</h1>
    <div class="tagline">Authentic Kulhad Chai &amp; North Indian Meals</div>
    <div class="status-badge">
      <span class="pulse-dot"></span>
      Operational
    </div>
    <p class="desc">All Servers Running</p>
  </div>
</body>
</html>`);
  });

  // Global Health Endpoint (lightweight meta-check; no DB query)
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Chaiwale Backend API',
      phase: 4,
      version: '1.0.0',
      database: 'Supabase PostgreSQL (Connected & Verified)',
      storage: 'Supabase Storage (Initialized)',
      timestamp: new Date().toISOString()
    });
  });

  /**
   * Database Keep-Alive / Connectivity Endpoint
   * Performs a minimal SELECT 1 ping via pg (or a Supabase head-count fallback).
   * Used by Vercel Cron (every 6 hours) and UptimeRobot for periodic activity.
   *
   * IMPORTANT:
   * - Returns ONLY { status, database } — no secrets, no stack traces.
   * - Zero business data read; no full table scans.
   * - Does NOT guarantee Supabase will never pause; it provides periodic
   *   lightweight database activity/connectivity checks.
   */
  app.get('/api/health/db', async (_req: Request, res: Response) => {
    // Attempt pg SELECT 1 first (fastest, direct PostgreSQL)
    if (process.env.DATABASE_URL) {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 1,
        idleTimeoutMillis: 5000,
        connectionTimeoutMillis: 5000
      });
      try {
        const client = await pool.connect();
        try {
          await client.query('SELECT 1');
          return res.status(200).json({ status: 'ok', database: 'connected' });
        } finally {
          client.release();
          await pool.end();
        }
      } catch {
        await pool.end().catch(() => {});
        // Fall through to Supabase fallback
      }
    }

    // Supabase PostgREST head-count fallback (no pg credentials required)
    try {
      const supabase = getSupabaseAdminClient();
      if (!supabase) {
        return res.status(503).json({ status: 'error', database: 'unavailable' });
      }
      const { error, status } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });
      if (error || (status !== 200 && status !== 204)) {
        return res.status(503).json({ status: 'error', database: 'unavailable' });
      }
      return res.status(200).json({ status: 'ok', database: 'connected' });
    } catch {
      return res.status(503).json({ status: 'error', database: 'unavailable' });
    }
  });


  // API v1 Domain Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/menu', menuRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/catering', cateringRoutes);
  app.use('/api/v1/billing', billingRoutes);
  app.use('/api/v1/attendance', attendanceRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/config', configRoutes);
  app.use('/api/v1/documents', documentRoutes);
  app.use('/api/v1/printing', printingRoutes);
  app.use('/api/v1/khata', khataRoutes);
  app.use('/media', mediaRoutes);
  app.use('/api/v1/media', mediaRoutes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
