/**
 * Canonical Chaiwale Business Configuration & Brand Identity
 * 
 * ARCHITECTURE PRINCIPLE:
 * Single Source of Truth for Chaiwale brand identity, contact details, 
 * official physical address, and communication channels.
 * 
 * Used across:
 * - PDF invoices, payment receipts, corporate statements
 * - Thermal ESC/POS receipts (58mm/80mm) & KOT
 * - Transactional email templates & headers/footers
 * - Backend operational status landing page
 * - SEO / Schema structured data
 */

export const BUSINESS_CONFIG = {
  brandName: 'Chaiwale',
  tagline: 'Authentic Kulhad Chai, North Indian Meals & Catering',
  legalName: 'Chaiwale Food Services',

  contact: {
    phone: '+91 93101 12564',
    secondaryPhone: '+91 93101 10414',
    helpline: '+91 93101 12564 / +91 93101 10414',
    phoneClean: '919310112564',
    whatsapp: '919310112564',
    supportEmail: 'support@chaiwale.co.in',
    ordersEmail: 'orders@chaiwale.co.in',
    billsEmail: 'bills@chaiwale.co.in',
    // INTERNAL ONLY - never exposed on public bills or customer emails
    internalOperationsEmail: 'chaiwale528@gmail.com'
  },

  address: {
    line1: 'Upper Ground Floor, Vardhman Grand Plaza, G-31, M2K Rd',
    line2: 'Mangalam Place, Sector 03, Rohini',
    full: 'Upper Ground Floor, Vardhman Grand Plaza, G-31, M2K Rd, Mangalam Place, Sector 03, Rohini, New Delhi, Delhi 110085',
    locality: 'Rohini',
    city: 'New Delhi',
    region: 'Delhi',
    postalCode: '110085',
    country: 'India',
    countryCode: 'IN',
    coordinates: {
      latitude: 28.7041,
      longitude: 77.1025
    }
  },

  urls: {
    website: 'https://chaiwale.co.in',
    api: 'https://api.chaiwale.co.in',
    admin: 'https://admin.chaiwale.co.in',
    billbook: 'https://bills.chaiwale.co.in',
    logo: 'https://chaiwale.co.in/assets/chaiwale-logo.jpeg'
  },

  tax: {
    gstin: null, // GSTIN unconfigured / Composition / Zero-tax
    defaultGstPercent: 0
  },

  payment: {
    defaultUpiId: 'paytmqr28100505010115gsv3315o55@paytm'
  },

  colors: {
    primary: '#6F432A', // Chaiwale Signature Brown
    secondary: '#8A7366',
    background: '#FAF7F5',
    accent: '#25D366'
  }
} as const;
