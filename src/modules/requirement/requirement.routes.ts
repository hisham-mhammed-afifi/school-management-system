import { Router } from 'express';
import type { RequirementController } from './requirement.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createRequirementRoutes(controller: RequirementController): Router {
  // Mounted at /class-sections/:sectionId/requirements
  const router = Router({ mergeParams: true });

  router.use(authenticate);

  router.get('/', requirePermission('requirements.list'), controller.get);
  router.put('/', requirePermission('requirements.update'), controller.set);

  return router;
}
