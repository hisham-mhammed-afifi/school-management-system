import { Router } from 'express';
import type { PeriodController } from './period.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createPeriodRoutes(controller: PeriodController): Router {
  const router = Router({ mergeParams: true });

  router.use(authenticate);

  router.get('/', requirePermission('scheduling.view'), controller.list);
  router.put('/', requirePermission('scheduling.manage'), controller.replace);

  return router;
}
