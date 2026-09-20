import { Router } from 'express';
import { KhataController } from './khata.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = Router();

// Khata operations accessible to authenticated BillBook / Admin users
router.get('/offices', requireAuth, KhataController.getOffices);
router.post('/offices', requireAuth, KhataController.createOffice);
router.post('/entries', requireAuth, KhataController.addEntry);
router.delete('/entries/:id', requireAuth, KhataController.deleteEntry);
router.post('/payments', requireAuth, KhataController.addPayment);
router.get('/statement/:officeId', requireAuth, KhataController.getOfficeStatement);

export const khataRoutes = router;
