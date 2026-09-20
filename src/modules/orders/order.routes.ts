import { Router } from 'express';
import { OrderController } from './order.controller';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware';
import { publicWriteRateLimiter, orderTrackRateLimiter } from '../../middlewares/rate-limit.middleware';

const router = Router();

// Public Storefront Endpoints
router.get('/health', OrderController.healthCheck);
router.post('/create', publicWriteRateLimiter, OrderController.createOrder);
router.get('/track/:orderNumber', orderTrackRateLimiter, OrderController.trackOrder);

// Protected Staff & Management Endpoints
router.get(
  '/recent',
  requireAuth,
  requireRole(['admin', 'manager', 'staff']),
  OrderController.getRecentOrders
);

router.patch(
  '/:id/status',
  requireAuth,
  requireRole(['admin', 'manager', 'staff']),
  OrderController.updateOrderStatus
);

router.patch(
  '/:id/verify-payment',
  requireAuth,
  requireRole(['admin', 'manager', 'staff']),
  OrderController.verifyPayment
);

export const orderRoutes = router;
