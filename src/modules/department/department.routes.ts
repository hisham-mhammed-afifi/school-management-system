import { Router } from 'express';
import type { DepartmentController } from './department.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createDepartmentRoutes(controller: DepartmentController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('departments.view'), controller.list);
  router.get('/:id', requirePermission('departments.view'), controller.getById);
  router.post('/', requirePermission('departments.create'), controller.create);
  router.patch('/:id', requirePermission('departments.update'), controller.update);
  router.delete('/:id', requirePermission('departments.delete'), controller.remove);

  return router;
}
