import { Router } from 'express';
import type { StudentGuardianController } from './student-guardian.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createStudentGuardianRoutes(controller: StudentGuardianController): Router {
  const router = Router({ mergeParams: true });

  router.use(authenticate);

  router.get('/', requirePermission('student-guardians.list'), controller.list);
  router.post('/', requirePermission('student-guardians.create'), controller.create);
  router.patch('/:id', requirePermission('student-guardians.update'), controller.update);
  router.delete('/:id', requirePermission('student-guardians.delete'), controller.remove);

  return router;
}
