import { Router } from 'express';
import { KhataController } from './khata.controller';
import { requireAuth } from '../../middlewares/auth.middleware';

const router = Router();

// ── PUBLIC: Customer self-service bill lookup (phone + PIN) ─────────────────
router.post('/customer/lookup', KhataController.customerLookup);

// ── ADMIN: Generate / set client PIN for an office ──────────────────────────
router.post('/offices/:id/pin', requireAuth, KhataController.setClientPin);

// Khata operations accessible to authenticated BillBook / Admin users
router.get('/offices', requireAuth, KhataController.getOffices);
router.post('/offices', requireAuth, KhataController.createOffice);
router.put('/offices/:id', requireAuth, KhataController.updateOffice);
router.delete('/offices/:id', requireAuth, KhataController.deleteOffice);
router.post('/entries', requireAuth, KhataController.addEntry);
router.delete('/entries/:id', requireAuth, KhataController.deleteEntry);
router.post('/payments', requireAuth, KhataController.addPayment);
router.delete('/payments/:id', requireAuth, KhataController.deletePayment);
router.get('/statement/:officeId', requireAuth, KhataController.getOfficeStatement);
router.get('/statement/:officeId/pdf', KhataController.getKhataStatementPdf);
router.get('/export/excel', requireAuth, KhataController.exportKhataExcel);

export const khataRoutes = router;

