import { Router } from 'express';
import { AdminController } from './admin.controller';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/health', AdminController.healthCheck);

// Operations Dashboard Stats: Manager and Admin
router.get(
  '/dashboard-stats',
  requireAuth,
  requireRole(['admin', 'manager']),
  AdminController.getDashboardStats
);

// Customer Directory: Manager and Admin
router.get(
  '/customers',
  requireAuth,
  requireRole(['admin', 'manager']),
  AdminController.getCustomers
);

export const adminRoutes = router;
