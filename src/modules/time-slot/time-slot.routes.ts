import { Router } from 'express';
import type { TimeSlotController } from './time-slot.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createTimeSlotRoutes(controller: TimeSlotController): Router {
  const router = Router({ mergeParams: true });

  router.use(authenticate);

  router.get('/', requirePermission('scheduling.view'), controller.list);
  router.post('/generate', requirePermission('scheduling.manage'), controller.generate);

  return router;
}
