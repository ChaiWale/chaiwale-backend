import { Router, Request, Response, NextFunction } from 'express';
import { getSupabaseAdminClient } from '../../config/supabase.config';

const router = Router();

/**
 * Public UPI & Brand Configuration Endpoint
 * Delivers verified UPI ID and genuine QR public URL from Supabase Storage
 */
router.get('/upi', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase client not initialized');
    }

    const { data } = await admin
      .from('app_settings')
      .select('value_json')
      .eq('key', 'brand_upi_config')
      .maybeSingle();

    const config = data?.value_json || {
      upi_id: 'chaiwale@ptyes',
      merchant_name: 'Chaiwale',
      account_holder: 'Shubham Sharma',
      qr_storage_path: 'branding/qr/chaiwale-upi-qr.jpeg'
    };

    const mediaQrUrl = '/media/branding/chaiwale-upi-qr.jpeg';
    const mediaLogoUrl = '/media/branding/chaiwale-logo.jpeg';

    res.json({
      success: true,
      data: {
        upiId: config.upi_id || 'chaiwale@ptyes',
        merchantName: config.merchant_name || 'Chaiwale',
        accountHolder: config.account_holder || 'Shubham Sharma',
        qrUrl: mediaQrUrl,
        qrPublicUrl: mediaQrUrl,
        logoPublicUrl: mediaLogoUrl
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Public Brand & Contact Info Endpoint
 */
router.get('/brand', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const whatsappNumber = process.env.WHATSAPP_PHONE_NUMBER || '919310112564';
    const phone = '+91 93101 12564';
    const address = 'Upper Ground Floor, Vardhman Grand Plaza, G-31, M2K Rd, Mangalam Place, Sector 03, Rohini, New Delhi, Delhi 110085';

    res.json({
      success: true,
      data: {
        brandName: 'Chaiwale',
        tagline: 'Sip, Bite, Repeat',
        whatsappNumber,
        phone,
        address,
        email: 'admin@chaiwale.co.in',
        upiId: 'chaiwale@ptyes',
        logoUrl: '/media/branding/logo/chaiwale-logo.jpeg',
        qrUrl: '/media/branding/qr/chaiwale-upi-qr.jpeg'
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

export const configRoutes = router;
