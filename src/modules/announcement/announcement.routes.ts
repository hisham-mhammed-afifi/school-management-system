import { Router } from 'express';
import type { AnnouncementController } from './announcement.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createAnnouncementRoutes(controller: AnnouncementController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('announcements.view'), controller.list);
  router.get('/:id', requirePermission('announcements.view'), controller.getById);
  router.post('/', requirePermission('announcements.create'), controller.create);
  router.patch('/:id', requirePermission('announcements.update'), controller.update);
  router.post('/:id/publish', requirePermission('announcements.publish'), controller.publish);
  router.delete('/:id', requirePermission('announcements.delete'), controller.remove);

  return router;
}
