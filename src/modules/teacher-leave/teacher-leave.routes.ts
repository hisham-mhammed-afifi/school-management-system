import { Router } from 'express';
import type { TeacherLeaveController } from './teacher-leave.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createTeacherLeaveRoutes(controller: TeacherLeaveController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('leaves.view'), controller.list);
  router.get('/:id', requirePermission('leaves.view'), controller.getById);
  router.post('/', requirePermission('leaves.request'), controller.create);
  router.post('/:id/approve', requirePermission('leaves.approve'), controller.approve);
  router.post('/:id/reject', requirePermission('leaves.approve'), controller.reject);
  router.post('/:id/cancel', requirePermission('leaves.request'), controller.cancel);

  return router;
}
