import { Router } from 'express';
import type { PeriodSetController } from './period-set.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createPeriodSetRoutes(controller: PeriodSetController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('scheduling.view'), controller.list);
  router.get('/:id', requirePermission('scheduling.view'), controller.getById);
  router.post('/', requirePermission('scheduling.manage'), controller.create);
  router.patch('/:id', requirePermission('scheduling.manage'), controller.update);
  router.delete('/:id', requirePermission('scheduling.manage'), controller.remove);

  return router;
}
