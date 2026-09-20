import { Router } from 'express';
import { BillingController } from './billing.controller';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/health', BillingController.healthCheck);

// Public pure authoritative calculation engine (no financial records exposed)
router.post('/calculate', BillingController.calculateTotals);

// Protected Staff & Management POS Invoicing
router.post(
  '/invoice',
  requireAuth,
  requireRole(['admin', 'manager', 'staff']),
  BillingController.generateInvoice
);
router.post(
  '/invoices',
  requireAuth,
  requireRole(['admin', 'manager', 'staff']),
  BillingController.generateInvoice
);

router.get(
  '/invoices',
  requireAuth,
  requireRole(['admin', 'manager', 'staff']),
  BillingController.getInvoices
);

router.get(
  '/invoices/:id',
  requireAuth,
  requireRole(['admin', 'manager', 'staff']),
  BillingController.getInvoiceById
);

// Protected Staff & Management Payment Recording (Full, Partial, Settlement)
router.post(
  '/payment',
  requireAuth,
  requireRole(['admin', 'manager', 'staff']),
  BillingController.recordPayment
);

// Protected Manager & Admin Confidential Corporate Ledger & Statements
router.get(
  '/ledger',
  requireAuth,
  requireRole(['admin', 'manager']),
  BillingController.getLedger
);

router.get(
  '/statement/:clientId',
  requireAuth,
  requireRole(['admin', 'manager']),
  BillingController.getCorporateStatement
);

export const billingRoutes = router;
