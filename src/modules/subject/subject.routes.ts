import { Router } from 'express';
import type { SubjectController } from './subject.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createSubjectRoutes(controller: SubjectController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('subjects.view'), controller.list);
  router.get('/:id', requirePermission('subjects.view'), controller.getById);
  router.post('/', requirePermission('subjects.create'), controller.create);
  router.patch('/:id', requirePermission('subjects.update'), controller.update);
  router.delete('/:id', requirePermission('subjects.delete'), controller.remove);
  router.put('/:subjectId/grades', requirePermission('subjects.manage'), controller.setGrades);

  return router;
}

export function createGradeSubjectsRoutes(controller: SubjectController): Router {
  // Mounted at /grades/:gradeId/subjects
  const router = Router({ mergeParams: true });

  router.use(authenticate);

  router.get('/', requirePermission('subjects.view'), controller.getByGrade);

  return router;
}
