import { Router } from 'express';
import type { TermController } from './term.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createTermNestedRoutes(controller: TermController): Router {
  // Mounted at /academic-years/:yearId/terms
  const router = Router({ mergeParams: true });

  router.use(authenticate);

  router.get('/', requirePermission('terms.view'), controller.listByYear);
  router.post('/', requirePermission('terms.create'), controller.create);

  return router;
}

export function createTermRoutes(controller: TermController): Router {
  // Mounted at /terms
  const router = Router();

  router.use(authenticate);

  router.patch('/:id', requirePermission('terms.update'), controller.update);
  router.delete('/:id', requirePermission('terms.delete'), controller.remove);

  return router;
}
