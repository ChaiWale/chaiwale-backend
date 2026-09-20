import { Router, Request, Response, NextFunction } from 'express';

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
