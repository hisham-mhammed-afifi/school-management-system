import { Router } from 'express';
import type { TeacherController } from './teacher.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createTeacherRoutes(controller: TeacherController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('teachers.view'), controller.list);
  router.get('/:id', requirePermission('teachers.view'), controller.getById);
  router.post('/', requirePermission('teachers.create'), controller.create);
  router.patch('/:id', requirePermission('teachers.update'), controller.update);
  router.delete('/:id', requirePermission('teachers.delete'), controller.remove);

  // Subject assignments
  router.get('/:id/subjects', requirePermission('teachers.view'), controller.getSubjects);
  router.put('/:id/subjects', requirePermission('teachers.update'), controller.assignSubjects);

  return router;
}
