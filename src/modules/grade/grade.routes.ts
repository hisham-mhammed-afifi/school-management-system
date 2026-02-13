import { Router } from 'express';
import type { GradeController } from './grade.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createGradeRoutes(controller: GradeController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('grades.view'), controller.list);
  router.get('/:id', requirePermission('grades.view'), controller.getById);
  router.post('/', requirePermission('grades.create'), controller.create);
  router.patch('/:id', requirePermission('grades.update'), controller.update);
  router.delete('/:id', requirePermission('grades.delete'), controller.remove);

  return router;
}
