import { Router } from 'express';
import { AttendanceController } from './attendance.controller';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/health', AttendanceController.healthCheck);

// Roster Viewing allowed for Staff, Manager, Admin
router.get(
  '/roster',
  requireAuth,
  requireRole(['admin', 'manager', 'staff']),
  AttendanceController.getRoster
);

// Attendance Saving restricted to Manager and Admin
router.post(
  '/save',
  requireAuth,
  requireRole(['admin', 'manager']),
  AttendanceController.saveRoster
);

export const attendanceRoutes = router;
