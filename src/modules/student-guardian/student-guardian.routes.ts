import { Router } from 'express';
import type { StudentGuardianController } from './student-guardian.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createStudentGuardianRoutes(controller: StudentGuardianController): Router {
  const router = Router({ mergeParams: true });

  router.use(authenticate);

  router.get('/', requirePermission('students.view'), controller.list);
  router.post('/', requirePermission('students.update'), controller.create);
  router.patch('/:id', requirePermission('students.update'), controller.update);
  router.delete('/:id', requirePermission('students.update'), controller.remove);

  return router;
}
