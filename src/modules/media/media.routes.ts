import { Router, Request, Response, NextFunction } from 'express';
import { StorageService } from '../storage/storage.service';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware';

const router = Router();
const PUBLIC_BUCKETS = new Set(['branding', 'menu', 'catering']);
const SUPABASE_STORAGE_URL = 'https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public';

const MIME_TYPES: Record<string, string> = {
  webp: 'image/webp',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  gif: 'image/gif',
  ico: 'image/x-icon'
};

/**
 * Upload Media Endpoint (Admin / Staff / Manager)
 * Accepts base64 image or data URL, validates, and saves to Supabase Storage 'menu' bucket as WebP.
 * Always stores in WebP format.
 */
router.post(
  '/upload',
  requireAuth,
  requireRole(['admin', 'manager', 'staff']),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { imageBase64, fileName, folder = 'items', bucket = 'menu' } = req.body;

      if (!imageBase64) {
        res.status(400).json({
          success: false,
          message: 'Image data (imageBase64) is required'
        });
        return;
      }

      // Check bucket safety
      if (!PUBLIC_BUCKETS.has(bucket)) {
        res.status(403).json({
          success: false,
          message: 'Upload allowed only to public media buckets'
        });
        return;
      }

      // Extract base64 payload & content-type
      let contentType = 'image/webp';
      let rawBase64 = imageBase64;

      if (imageBase64.includes(';base64,')) {
        const parts = imageBase64.split(';base64,');
        const match = parts[0].match(/data:(.*?)$/);
        if (match && match[1]) {
          contentType = match[1];
        }
        rawBase64 = parts[1];
      }

      const fileBuffer = Buffer.from(rawBase64, 'base64');

      // Sanitize folder & filename
      const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || 'items';
      const cleanName = (fileName || 'item')
        .toLowerCase()
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'item';

      const timestamp = Date.now();
      const storagePath = `${safeFolder}/${cleanName}-${timestamp}.webp`;

      const uploadedPath = await StorageService.uploadMedia({
        bucket: bucket as any,
        path: storagePath,
        fileBuffer,
        contentType: 'image/webp',
        isPublic: true
      });

      if (!uploadedPath) {
        res.status(500).json({
          success: false,
          message: 'Storage upload failed. Supabase client unavailable.'
        });
        return;
      }

      const imagePath = `${bucket}/${uploadedPath}`;
      const publicUrl = `${SUPABASE_STORAGE_URL}/${bucket}/${uploadedPath}`;

      res.status(201).json({
        success: true,
        message: 'Image uploaded successfully to Supabase Storage as WebP',
        data: {
          imagePath,
          storagePath: uploadedPath,
          publicUrl
        }
      });
    } catch (err: any) {
      next(err);
    }
  }
);

/**
 * Public Media Proxy Endpoint
 * Route pattern: /:bucket/* (e.g. /branding/logo/chaiwale-logo.jpeg or /menu/tea/chai.webp)
 * Served under /media and /api/v1/media
 */
router.get('/:bucket/*', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bucket = req.params.bucket.toLowerCase();
    const objectPath = req.params[0];

    // SECURITY GUARD: Strictly prohibit access to private buckets
    if (!PUBLIC_BUCKETS.has(bucket)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access to private documents and invoices is strictly disallowed via public media endpoint'
        }
      });
      return;
    }

    if (!objectPath) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PATH',
          message: 'Object path is required'
        }
      });
      return;
    }

    // PATH TRAVERSAL GUARD: Block attempts to traverse directory structure
    if (
      objectPath.includes('..') ||
      objectPath.includes('\\') ||
      objectPath.includes('%2e%2e') ||
      objectPath.includes('%2E%2E') ||
      objectPath.includes('%5c') ||
      objectPath.includes('%5C') ||
      objectPath.startsWith('/')
    ) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PATH',
          message: 'Invalid media path. Directory traversal is strictly disallowed.'
        }
      });
      return;
    }

    const targetUrl = `${SUPABASE_STORAGE_URL}/${bucket}/${objectPath}`;
    const response = await fetch(targetUrl);

    if (!response.ok) {
      res.status(response.status).json({ success: false, message: 'Media object not found' });
      return;
    }

    const ext = objectPath.split('.').pop()?.toLowerCase() || '';
    const contentType = response.headers.get('content-type') || MIME_TYPES[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');

    // Stream binary body to client
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    next(err);
  }
});

export const mediaRoutes = router;
