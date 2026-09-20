import { Router } from 'express';
import { MenuController } from './menu.controller';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware';

const router = Router();

// Public Catalog Queries
router.get('/health', MenuController.healthCheck);
router.get('/categories', MenuController.getCategories);
router.get('/items', MenuController.getItems);
router.get('/items/:id', MenuController.getItemById);

// Protected Management Operations (Admin and Orders Staff)
router.post(
  '/items',
  requireAuth,
  requireRole(['admin', 'manager', 'staff']),
  MenuController.createItem
);

router.put(
  '/items/:id',
  requireAuth,
  requireRole(['admin', 'manager', 'staff']),
  MenuController.updateItem
);

router.patch(
  '/items/:id/availability',
  requireAuth,
  requireRole(['admin', 'manager', 'staff']),
  MenuController.updateItemAvailability
);

router.post(
  '/categories',
  requireAuth,
  requireRole(['admin', 'manager', 'staff']),
  MenuController.createCategory
);

router.put(
  '/categories/:id',
  requireAuth,
  requireRole(['admin', 'manager', 'staff']),
  MenuController.updateCategory
);

export const menuRoutes = router;
