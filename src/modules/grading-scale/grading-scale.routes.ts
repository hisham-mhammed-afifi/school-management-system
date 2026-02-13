import { Router } from 'express';
import type { GradingScaleController } from './grading-scale.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createGradingScaleRoutes(controller: GradingScaleController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('grading.view'), controller.list);
  router.get('/:id', requirePermission('grading.view'), controller.getById);
  router.post('/', requirePermission('grading.manage'), controller.create);
  router.patch('/:id', requirePermission('grading.manage'), controller.update);
  router.delete('/:id', requirePermission('grading.manage'), controller.remove);

  return router;
}
