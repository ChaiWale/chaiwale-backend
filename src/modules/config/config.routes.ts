import { Router, Request, Response, NextFunction } from 'express';
import { getSupabaseAdminClient } from '../../config/supabase.config';
import { emailService } from '../notifications/email/email.service';

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

/**
 * Default Homepage Hero Slides (5 Master Slides)
 */
export const DEFAULT_HERO_SLIDES = [
  {
    id: 'signature',
    badge: 'CHAIWALE SPECIAL',
    tag: 'Kadak Chai, Thick Shakes, Thalis & Bites',
    headline: 'Asli Kadak Chai, Shakes & Thalis,',
    headlineAccent: 'Har Craving Ka Shuddh Swad.',
    sub: 'Subah ki taaza adrak-elaichi chai, premium thick shakes, desi ghee homestyle thalis, grilled sandwiches aur kurkure snacks — 100% shuddh aur dil se taiyar.',
    primaryCtaLabel: 'Order Food Online',
    primaryCtaHref: '/menu',
    waCtaLabel: 'Order on WhatsApp',
    waCtaHref: 'https://wa.me/918800410441?text=Hi%20Chaiwale%2C%20I%20want%20to%20order%20from%20Chaiwale%20Signature%20Menu.',
    highlights: ['Pure Veg & Desi Ghee Thalis', 'Rich Thick Shakes & Chai', 'Direct Rohini Fast Delivery'],
    image: 'https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/branding/hero/hero-signature.webp',
    imageAlt: 'Chaiwale Signature Kadak Chai, Thick Shakes, Grilled Sandwiches, Bun Maska and Snacks',
    order: 1
  },
  {
    id: 'bhandara',
    badge: 'PAVITRA BHANDARA SEVA',
    tag: '51 to 5,000+ Devotee Catering',
    headline: 'Pavitra Bhandara Seva,',
    headlineAccent: 'Shraddha Aur Shuddhata Ke Saath.',
    sub: 'Live Desi Ghee garam puris, halwai style aloo tamatar rasedar sabzi, kesari halwa & boondi raita — 100% shuddh satvik prasad for Puja, Jagran & Mandir feasts.',
    primaryCtaLabel: 'Get Bhandara Quote',
    primaryCtaHref: '/catering#bhandara',
    waCtaLabel: 'Calculate Thali Cost',
    waCtaHref: 'https://wa.me/918800410441?text=Hi%20Chaiwale%2C%20I%20want%20to%20book%20Bhandara%20Seva%20catering.',
    highlights: ['100% Satvik (No Onion/Garlic)', 'Live Garam Puris On-Site', 'Scalable Mass Feasts'],
    image: 'https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/branding/hero/hero-bhandara.webp',
    imageAlt: 'Bhandara Seva Thali with Golden Puris and Kesari Halwa',
    order: 2
  },
  {
    id: 'corporate',
    badge: 'CORPORATE TEA & REFRESHMENTS',
    tag: 'Daily Office Dispensers & Platters',
    headline: 'Smart Office Chai Breaks,',
    headlineAccent: 'Piping Hot Chai Delivered Daily.',
    sub: 'Premium 4-hour heat retention dispensers me garam chai, cutting glasses, cocktail samosas aur cookies — office pantry me bina kisi jhanjhat ke.',
    primaryCtaLabel: 'Get Corporate Quote',
    primaryCtaHref: '/catering#corporate',
    waCtaLabel: 'Book Free Office Tasting',
    waCtaHref: 'https://wa.me/918800410441?text=Hi%20Chaiwale%2C%20I%20want%20corporate%20chai%20catering%20for%20our%20office.',
    highlights: ['4-Hour Heat Retention Dispensers', 'Fresh Cutting Cups & Snacks', 'Timely Daily Pantry Delivery'],
    image: 'https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/branding/hero/hero-corporate.webp',
    imageAlt: 'Corporate Stainless Steel Thermal Chai Dispensers and Refreshments',
    order: 3
  },
  {
    id: 'mealplan',
    badge: 'DAILY HOMESTYLE MEAL PLAN',
    tag: 'Ghar Jaisa Swad Rozana',
    headline: 'Roz Ka Homestyle Khana,',
    headlineAccent: 'Bina Kisi Pareshani Ke.',
    sub: 'Piping hot phulke with desi ghee, daal tadka, seasonal sabzis, jeera rice & fresh salad — zero excess oil, bilkul ghar jaisa swad aur poshan.',
    primaryCtaLabel: 'View Meal Plans',
    primaryCtaHref: '/meal-plans',
    waCtaLabel: 'Start ₹79 Trial Meal',
    waCtaHref: 'https://wa.me/918800410441?text=Hi%20Chaiwale%2C%20I%20want%20to%20book%20a%20Trial%20Meal.',
    highlights: ['Different Homestyle Menu Daily', 'Zero Excess Oil & Preservatives', 'Pause or Cancel Anytime'],
    image: 'https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/branding/hero/hero-mealplan.webp',
    imageAlt: 'Daily Ghar Ka Khana Homestyle Meal Plan Thali',
    order: 4
  },
  {
    id: 'momsdaawat',
    badge: 'MOM’S DAAWAT CATERING',
    tag: 'Parties, Celebrations & Banquets',
    headline: "Mom's Daawat — Shahi Dawat,",
    headlineAccent: 'Dil Se Pakaya, Shaan Se Parosa.',
    sub: 'Mitti ki handi me slow-cooked Champaran Ahuna, rich Mughlai gravies, live tawa rotis aur dum biryani — wedding, birthday aur family celebrations ke liye.',
    primaryCtaLabel: "View Mom's Daawat Menu",
    primaryCtaHref: '/menu#moms-daawat',
    waCtaLabel: 'Plan Party Catering',
    waCtaHref: 'https://wa.me/918860909441?text=Hi%20Chaiwale%2C%20I%20want%20to%20plan%20catering%20from%20Mom%27s%20Daawat.',
    highlights: ['Slow Cooked Earthen Pot Recipes', 'Live On-Site Counters & Chefs', 'End-to-End Crockery & Decor'],
    image: 'https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/branding/hero/hero-momsdaawat.webp',
    imageAlt: "Mom's Daawat Royal Banquet and Champaran Handi Specialties",
    order: 5
  }
];

/**
 * Public Endpoint: Get Homepage Hero Slides
 */
router.get('/hero', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      res.json({ success: true, data: DEFAULT_HERO_SLIDES });
      return;
    }

    const { data } = await admin
      .from('app_settings')
      .select('value_json')
      .eq('key', 'homepage_hero_slides')
      .maybeSingle();

    const slides = Array.isArray(data?.value_json) && data.value_json.length > 0
      ? data.value_json
      : DEFAULT_HERO_SLIDES;

    res.json({
      success: true,
      data: slides,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Admin Endpoint: Update Homepage Hero Slides
 */
router.put('/hero', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase admin client not initialized');
    }

    const slides = req.body.slides;
    if (!Array.isArray(slides)) {
      res.status(400).json({ success: false, message: 'Invalid payload: slides must be an array' });
      return;
    }

    const { data, error } = await admin
      .from('app_settings')
      .upsert(
        {
          key: 'homepage_hero_slides',
          value_json: slides,
          description: 'Customizable 5-Slide Animated Homepage Hero Showcase',
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
      message: 'Homepage hero slides updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Default Meal Plans & PG Tiffin Configuration
 */
export const DEFAULT_MEAL_PLANS_CONFIG = {
  header: {
    title: 'GOOD FOOD FOR A BETTER YOU',
    subtitle: 'Ghar jaisa khana, ab door nahi.',
    targetAudience: 'For PGs, Working Professionals, Bachelors and Anyone Living Away from Home in Delhi NCR.',
    bannerImage: 'https://hwbdyuupfobpznfroapa.supabase.co/storage/v1/object/public/branding/meal-plans/chaiwale-meal-plan-poster.webp',
    phone: '8800410441',
    whatsapp: '918800410441',
    address: 'G-31, Vardhman Grand Plaza, Mangalam Palace, Rohini Sector 3, New Delhi'
  },
  trialOffer: {
    badge: '3-Day Trial Meal',
    price: '79',
    priceLabel: '₹79 ONLY',
    tagline: 'Try It. Taste the Difference!',
    ctaText: 'WhatsApp "TRIAL" to 8800410441',
    ctaUrl: 'https://wa.me/918800410441?text=TRIAL'
  },
  plans: [
    {
      id: 'basic',
      name: 'Basic Plan',
      badge: 'Economy',
      price: '3,499',
      period: 'month',
      mealTypes: 'Lunch + Dinner',
      includes: [
        'Lunch + Dinner',
        '4 Fresh Tawa Rotis',
        'Dal Tadka / Fry',
        '1 Seasonal Sabzi',
        'Steamed Rice',
        'Salad & Homemade Achar'
      ],
      popular: false
    },
    {
      id: 'standard',
      name: 'Standard Plan',
      badge: 'MOST POPULAR / BEST SELLER',
      price: '5,500',
      period: 'month',
      mealTypes: 'Breakfast + Lunch + Dinner',
      includes: [
        'Breakfast + Lunch + Dinner',
        'Unlimited Garam Rotis',
        'Rice',
        'Special Item 2 times / week',
        'Daily Morning Kadak Chai Included'
      ],
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      badge: 'ROYAL FEAST',
      price: '6,999',
      period: 'month',
      mealTypes: 'Full Day Meals + Specials',
      includes: [
        'Full Day Meals (B’fast + Lunch + Dinner)',
        'Paneer / Chaap / Egg / Chicken Specials',
        'Sunday Special Sweet Dish (Kheer / Gulab Jamun)',
        'Cold Drink or Fresh Buttermilk twice weekly',
        'Unlimited Roti & Rice Every Day'
      ],
      popular: false
    }
  ],
  weeklyMenu: {
    breakfast: {
      title: 'Breakfast Menu',
      timing: '8:00 AM – 10:00 AM',
      highlight: 'Kadak Chai Included Daily',
      schedule: [
        { day: 'Monday', items: 'Poha + Taaza Kadak Chai' },
        { day: 'Tuesday', items: 'Garam Aloo Paratha + Fresh Curd' },
        { day: 'Wednesday', items: 'Bread Omelette / Veg Grilled Sandwich' },
        { day: 'Thursday', items: 'Besan Chilla + Mint Coriander Chutney' },
        { day: 'Friday', items: 'Masala Maggi + Taaza Kadak Chai' },
        { day: 'Saturday', items: 'Paneer Bhurji / Grilled Sandwich' },
        { day: 'Sunday', items: 'Delhi Style Chole Kulche / Poori Sabzi' }
      ]
    },
    lunch: {
      title: 'Lunch Menu',
      timing: '1:00 PM – 3:00 PM',
      highlight: 'Unlimited Steamed Rice',
      schedule: [
        { day: 'Monday', items: 'Dal Fry + Mix Veg + Steamed Rice + Rotis' },
        { day: 'Tuesday', items: 'Punjabi Rajma Chawal + Onion Cucumber Salad' },
        { day: 'Wednesday', items: 'Pindi Chole + Jeera Rice + Garam Rotis' },
        { day: 'Thursday', items: 'Kadhi Pakoda + Rice + Aloo Sukhi Sabzi' },
        { day: 'Friday', items: 'Dal Makhani + Steamed Rice + Garam Rotis' },
        { day: 'Saturday', items: 'Paneer Masala Gravy + Jeera Rice + Rotis' },
        { day: 'Sunday', items: 'Special Sunday Shahi Veg Thali Feast' }
      ]
    },
    dinner: {
      title: 'Dinner Menu',
      timing: '8:00 PM – 11:00 PM',
      highlight: 'Unlimited Tawa Rotis',
      schedule: [
        { day: 'Monday', items: 'Garam Rotis + Arhar Dal + Seasonal Dry Sabzi' },
        { day: 'Tuesday', items: 'Garam Rotis + Tari Wale Chole + Jeera Rice' },
        { day: 'Wednesday', items: 'Garam Rotis + Paneer Bhurji Gravy' },
        { day: 'Thursday', items: 'Garam Rotis + Dal Tadka + Jeera Rice' },
        { day: 'Friday', items: 'Garam Rotis + Chaap Masala Gravy' },
        { day: 'Saturday', items: 'Egg Curry / Chicken Curry (or Matar Paneer for Veg)' },
        { day: 'Sunday', items: 'Special Weekend Dinner Combo' }
      ]
    }
  },
  addOns: [
    { item: 'Extra Tawa Roti', price: '₹10' },
    { item: 'Egg Curry (2 Eggs)', price: '₹60' },
    { item: 'Chicken Meal Portion', price: '₹120' },
    { item: 'Chilled Cold Drink / Buttermilk', price: '₹20 – ₹40' },
    { item: 'Sweet Dish (Gulab Jamun / Kheer)', price: '₹30' }
  ],
  features: [
    { title: 'Ghar Jaisa Taste', desc: 'Light, homestyle tadka, zero excess oil or acidity.' },
    { title: 'Quantity Full On', desc: 'Pet bharke khana! Unlimited Roti & Rice on Standard/Premium.' },
    { title: 'Time Pe Delivery', desc: 'Piping hot meals delivered straight to your PG/doorstep daily.' },
    { title: 'Hygienic & Clean', desc: '100% RO water cooked in sanitized commercial kitchens.' },
    { title: 'Weekly Variety', desc: 'Different mouthwatering menu every single day of the week.' },
    { title: 'Sunday Special Feasts', desc: 'Festive delicacies and sweet treats every weekend.' }
  ],
  specialOffers: [
    '3-Day Trial Meal — ₹79 ONLY',
    'Refer a Friend & Get 2 Meals Completely FREE',
    'Monthly Advance Payment = FREE Sunday Special Feasts',
    'Pause or Cancel anytime when travelling or going home'
  ]
};

/**
 * Public Endpoint: Get Meal Plans Config
 */
router.get('/meal-plans', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      res.json({ success: true, data: DEFAULT_MEAL_PLANS_CONFIG });
      return;
    }

    const { data } = await admin
      .from('app_settings')
      .select('value_json')
      .eq('key', 'meal_plans_config')
      .maybeSingle();

    const config = data?.value_json || DEFAULT_MEAL_PLANS_CONFIG;

    res.json({
      success: true,
      data: config,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Admin Endpoint: Update Meal Plans Config
 */
router.put('/meal-plans', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      throw new Error('Supabase admin client not initialized');
    }

    const mealPlans = req.body;
    if (!mealPlans || typeof mealPlans !== 'object') {
      res.status(400).json({ success: false, message: 'Invalid payload: meal plans config must be an object' });
      return;
    }

    const { data, error } = await admin
      .from('app_settings')
      .upsert(
        {
          key: 'meal_plans_config',
          value_json: mealPlans,
          description: 'Chaiwale PG & Monthly Meal Service Pricing, Plans & Menu Schedule',
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
      message: 'Meal plans configuration updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Public Endpoint: Submit Meal Plan / ₹79 Trial Lead
 * Saves lead in database and immediately dispatches an alert email to chaiwale528@gmail.com
 */
router.post('/meal-plans/enquire', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      customerName,
      phone,
      email,
      planId,
      planName,
      planPrice,
      shift,
      address,
      notes
    } = req.body;

    if (!customerName || !phone) {
      res.status(400).json({
        success: false,
        message: 'Name and WhatsApp/phone number are required.'
      });
      return;
    }

    const leadNumber = `MPL-${Date.now().toString().slice(-6)}`;
    const effectivePlan = planName || planId || 'Meal Plan Subscription';
    const effectivePrice = planPrice ? `₹${planPrice}` : '';

    // 1. Attempt database persistence in Supabase
    try {
      const admin = getSupabaseAdminClient();
      if (admin) {
        await admin.from('catering_enquiries').insert({
          lead_number: leadNumber,
          customer_name: customerName,
          phone: phone,
          email: email || null,
          service_type: 'EVENT_BULK',
          headcount: 1,
          requirements: `[MEAL PLAN LEAD] Plan: ${effectivePlan} ${effectivePrice} | Shift: ${shift || 'All Meals'} | Delivery Area/PG: ${address || 'N/A'} | Notes: ${notes || 'None'}`,
          status: 'NEW'
        });
      }
    } catch (dbErr: any) {
      console.warn('[MEAL PLAN DB NOTICE]', dbErr.message);
    }

    // 2. Dispatch immediate Resend lead email to chaiwale528@gmail.com
    try {
      const emailResult = await emailService.sendLeadNotification({
        leadType: 'MEAL_PLAN',
        referenceId: leadNumber,
        customerName,
        phone,
        email,
        planOrService: `${effectivePlan} ${effectivePrice}`.trim(),
        headcountOrPeriod: shift ? `Delivery Shift: ${shift}` : 'Daily Homestyle Tiffin',
        locationOrAddress: address,
        timingOrDate: shift,
        notes,
        receivedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      });
      console.log(`[MEAL PLAN LEAD EMAIL] Dispatched email for ${leadNumber}:`, emailResult.success ? 'SUCCESS' : emailResult.error);
    } catch (mailErr: any) {
      console.error('[MEAL PLAN LEAD EMAIL ERROR]', mailErr.message);
    }

    res.status(201).json({
      success: true,
      leadNumber,
      message: 'Meal plan inquiry submitted and lead notification dispatched to operations.',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

export const configRoutes = router;


