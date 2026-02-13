import { Router } from 'express';
import type { TeacherAvailabilityController } from './teacher-availability.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createTeacherAvailabilityRoutes(controller: TeacherAvailabilityController): Router {
  const router = Router({ mergeParams: true });

  router.use(authenticate);

  router.get('/', requirePermission('availability.view'), controller.get);
  router.put('/', requirePermission('availability.manage'), controller.replace);

  return router;
}
