import { Router } from 'express';
import type { SchoolController } from './school.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createPlatformSchoolRoutes(controller: SchoolController): Router {
  const router = Router();

  router.use(authenticate);
  router.use(requirePermission('platform.manage'));

  router.post('/', controller.create);
  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.patch('/:id', controller.update);
  router.post('/:id/suspend', controller.suspend);
  router.post('/:id/reactivate', controller.reactivate);

  return router;
}

export function createSchoolProfileRoutes(controller: SchoolController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('school.view'), controller.getProfile);
  router.patch('/', requirePermission('school.update'), controller.updateProfile);

  return router;
}
