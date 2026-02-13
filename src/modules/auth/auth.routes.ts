import { Router } from 'express';
import type { AuthController } from './auth.controller.ts';
import { authenticate } from '../../shared/middleware/auth.middleware.ts';

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  // Public
  router.post('/login', controller.login);
  router.post('/refresh', controller.refresh);
  router.post('/forgot-password', controller.forgotPassword);
  router.post('/reset-password', controller.resetPassword);

  // Authenticated
  router.post('/logout', authenticate, controller.logout);
  router.get('/me', authenticate, controller.getMe);
  router.patch('/me', authenticate, controller.updateMe);

  return router;
}
