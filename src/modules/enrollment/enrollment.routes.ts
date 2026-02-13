import { Router } from 'express';
import type { EnrollmentController } from './enrollment.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createEnrollmentRoutes(controller: EnrollmentController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('enrollments.view'), controller.list);
  router.get('/:id', requirePermission('enrollments.view'), controller.getById);
  router.post('/', requirePermission('enrollments.create'), controller.create);
  router.post('/bulk-promote', requirePermission('enrollments.create'), controller.bulkPromote);
  router.patch('/:id', requirePermission('enrollments.update'), controller.update);
  router.delete('/:id', requirePermission('enrollments.delete'), controller.remove);

  return router;
}
