import dotenv from 'dotenv';
dotenv.config();

const parseCorsOrigins = (): string[] => {
  if (process.env.CORS_ORIGINS) {
    return process.env.CORS_ORIGINS.split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  
  // Official Approved Chaiwale Production Origins
  const productionOrigins = [
    'https://chaiwale.co.in',
    'https://www.chaiwale.co.in',
    'https://admin.chaiwale.co.in',
    'https://bills.chaiwale.co.in'
  ];

  if (process.env.NODE_ENV === 'production') {
    // Production CORS contains ONLY the approved production frontend origins
    return productionOrigins;
  }

  // In local development, also allow localhost ports
  return [
    ...productionOrigins,
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3001',
    process.env.BILLBOOK_URL || 'http://localhost:3002'
  ];
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT || '5000', 10),
  appUrl: (process.env.APP_URL || process.env.FRONTEND_URL || 'https://chaiwale.co.in').replace(/\/+$/, ''),
  apiUrl: (process.env.API_URL || 'https://api.chaiwale.co.in').replace(/\/+$/, ''),
  adminUrl: (process.env.ADMIN_URL || 'https://admin.chaiwale.co.in').replace(/\/+$/, ''),
  billbookUrl: (process.env.BILLBOOK_URL || 'https://bills.chaiwale.co.in').replace(/\/+$/, ''),
  allowedOrigins: parseCorsOrigins(),
  supabase: {
    url: (process.env.SUPABASE_URL || '').replace(/\/+$/, ''),
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },
  whatsapp: {
    provider: process.env.WHATSAPP_PROVIDER || 'link',
    apiKey: process.env.WHATSAPP_API_KEY || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    businessNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919310112564'
  },
  email: {
    apiKey: process.env.RESEND_API_KEY || '',
    fromBills: process.env.EMAIL_FROM_BILLS || 'Chaiwale Bills <bills@chaiwale.co.in>',
    fromOrders: process.env.EMAIL_FROM_ORDERS || 'Chaiwale Orders <orders@chaiwale.co.in>',
    fromSupport: process.env.EMAIL_FROM_SUPPORT || 'Chaiwale Support <support@chaiwale.co.in>',
    supportNotificationEmail: process.env.SUPPORT_NOTIFICATION_EMAIL || 'chaiwale528@gmail.com'
  }
};
