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

export interface PromoBanner {
  id: string;
  badge: string;
  title: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  whatsappNumber?: string;
  whatsappText?: string;
  theme?: 'cream' | 'dark' | 'amber';
  isActive: boolean;
  order: number;
}

export const DEFAULT_PROMO_BANNERS: PromoBanner[] = [
  {
    id: 'bhandara',
    badge: 'Bhandara & Mass Feasts Catering',
    title: 'Bhandara Hai? Khana Hum Sambhal Lenge.',
    description: 'Temple Bhandaras, Jagran, Seva, and Mass Community Feasts for 50 to 2000+ devotees. 100% Satvik, clean, and prepared with pure ingredients.',
    image: '/assets/bhandara-banner.jpg',
    ctaText: 'Get Bhandara Quote',
    ctaLink: '/catering#bhandara',
    whatsappNumber: '918800410441',
    whatsappText: 'Hello Chaiwale, I want to inquire about Bhandara & Religious Feast Catering. Please share custom menu options and quote.',
    theme: 'amber',
    isActive: true,
    order: 1
  },
  {
    id: 'monthly-meals',
    badge: '3-Day Trial Meal @ ₹79 Only!',
    title: 'Good Food For A Better You',
    description: 'Ghar jaisa khana, ab door nahi. For PGs, Working Professionals, Bachelors and Anyone Living Away from Home in Delhi NCR.',
    image: '/assets/monthly-meals-banner.jpg',
    ctaText: 'WhatsApp Trial Plan',
    ctaLink: 'https://wa.me/918800410441?text=TRIAL',
    whatsappNumber: '918800410441',
    whatsappText: 'TRIAL',
    theme: 'cream',
    isActive: true,
    order: 2
  },
  {
    id: 'moms-daawat',
    badge: 'A Unit of Chaiwale',
    title: 'MOM’S DAAWAT',
    description: 'Ghar Jaisa Swad • Dil Se Pakaya. Authentic Bihari Chicken & Mutton, Champaran Ahuna Handi, Cream Chicken, Lemon Chicken, Butter Chicken, and sizzling kebabs slow cooked in authentic earthen pots.',
    image: '/assets/moms-daawat-banner.jpg',
    ctaText: "View Mom's Daawat Menu",
    ctaLink: '/menu#moms-daawat',
    whatsappNumber: '918860909441',
    whatsappText: "Hello, I want to order from Mom's Daawat",
    theme: 'dark',
    isActive: true,
    order: 3
  }
];

/**
 * Public Endpoint: Get Homepage Promotional Banners
 */
router.get('/banners', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      res.json({ success: true, data: DEFAULT_PROMO_BANNERS });
      return;
    }

    const { data } = await admin
      .from('app_settings')
      .select('value_json')
      .eq('key', 'homepage_promo_banners')
      .maybeSingle();

    const banners = Array.isArray(data?.value_json) && data.value_json.length > 0
      ? data.value_json
      : DEFAULT_PROMO_BANNERS;

    res.json({
      success: true,
      data: banners,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Admin Endpoint: Update Homepage Promotional Banners
 */
router.put('/banners', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase admin client not initialized');
    }

    const banners = req.body.banners;
    if (!Array.isArray(banners)) {
      res.status(400).json({ success: false, message: 'Invalid payload: banners must be an array' });
      return;
    }

    const { data, error } = await admin
      .from('app_settings')
      .upsert(
        {
          key: 'homepage_promo_banners',
          value_json: banners,
          description: 'Customizable Homepage Promotional Banners & Ad Cards',
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      )
      .select('value_json')
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data.value_json,
      message: 'Homepage promotional banners updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

export const configRoutes = router;
