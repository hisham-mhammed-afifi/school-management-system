import { Router } from 'express';
import type { SubstitutionController } from './substitution.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createSubstitutionRoutes(controller: SubstitutionController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('substitutions.view'), controller.list);
  router.get('/:id', requirePermission('substitutions.view'), controller.getById);
  router.post('/', requirePermission('substitutions.create'), controller.create);
  router.patch('/:id', requirePermission('substitutions.update'), controller.update);
  router.delete('/:id', requirePermission('substitutions.delete'), controller.remove);

  return router;
}
