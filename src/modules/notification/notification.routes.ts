import { Router } from 'express';
import type { NotificationController } from './notification.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createNotificationRoutes(controller: NotificationController): Router {
  const router = Router();

  router.use(authenticate);

  // Self-service routes (any authenticated user)
  router.get('/', controller.list);
  router.get('/unread-count', controller.unreadCount);
  router.post('/:id/read', controller.markRead);
  router.post('/read-all', controller.markAllRead);

  // Admin send route
  router.post('/send', requirePermission('notifications.send'), controller.send);

  return router;
}
