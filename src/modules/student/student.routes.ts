import { Router } from 'express';
import type { StudentController } from './student.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createStudentRoutes(controller: StudentController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('students.view'), controller.list);
  router.get('/:id', requirePermission('students.view'), controller.getById);
  router.post('/', requirePermission('students.create'), controller.create);
  router.patch('/:id', requirePermission('students.update'), controller.update);
  router.delete('/:id', requirePermission('students.delete'), controller.remove);

  return router;
}
