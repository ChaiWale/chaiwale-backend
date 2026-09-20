import { Router } from 'express';
import { CateringController } from './catering.controller';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware';
import { publicWriteRateLimiter } from '../../middlewares/rate-limit.middleware';

const router = Router();

// Public Catering Enquiry
router.get('/health', CateringController.healthCheck);
router.post('/enquire', publicWriteRateLimiter, CateringController.submitEnquiry);
router.post('/enquiry', publicWriteRateLimiter, CateringController.submitEnquiry);

// Protected Management Pipeline
router.get(
  '/leads',
  requireAuth,
  requireRole(['admin', 'manager']),
  CateringController.getLeads
);

router.patch(
  '/leads/:id/status',
  requireAuth,
  requireRole(['admin', 'manager']),
  CateringController.updateLeadStatus
);

router.post(
  '/leads/:id/advance',
  requireAuth,
  requireRole(['admin', 'manager']),
  CateringController.recordAdvancePayment
);

export const cateringRoutes = router;
