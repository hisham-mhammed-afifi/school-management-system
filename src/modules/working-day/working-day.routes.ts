import { Router } from 'express';
import type { WorkingDayController } from './working-day.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createWorkingDayRoutes(controller: WorkingDayController): Router {
  const router = Router({ mergeParams: true });

  router.use(authenticate);

  router.get('/', requirePermission('scheduling.view'), controller.list);
  router.put('/', requirePermission('scheduling.manage'), controller.replace);

  return router;
}
