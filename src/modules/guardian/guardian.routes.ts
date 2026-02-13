import { Router } from 'express';
import type { GuardianController } from './guardian.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createGuardianRoutes(controller: GuardianController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('guardians.view'), controller.list);
  router.get('/:id', requirePermission('guardians.view'), controller.getById);
  router.post('/', requirePermission('guardians.create'), controller.create);
  router.patch('/:id', requirePermission('guardians.update'), controller.update);
  router.delete('/:id', requirePermission('guardians.delete'), controller.remove);

  return router;
}
