import { Router } from 'express';
import type { FeeCategoryController } from './fee-category.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createFeeCategoryRoutes(controller: FeeCategoryController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('fees.view'), controller.list);
  router.post('/', requirePermission('fees.manage'), controller.create);
  router.patch('/:id', requirePermission('fees.manage'), controller.update);
  router.delete('/:id', requirePermission('fees.manage'), controller.remove);

  return router;
}
