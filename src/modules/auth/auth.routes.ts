import { Router } from 'express';
import { AuthController } from './auth.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { authRateLimiter } from '../../middlewares/rate-limit.middleware';

const router = Router();

router.get('/health', AuthController.healthCheck);
router.post('/login', authRateLimiter, AuthController.login);
router.get('/me', requireAuth, AuthController.getMe);

export const authRoutes = router;
