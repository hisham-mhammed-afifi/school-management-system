import { Router } from 'express';
import type { ExamSubjectController } from './exam-subject.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createExamSubjectRoutes(controller: ExamSubjectController): Router {
  const router = Router({ mergeParams: true });

  router.use(authenticate);

  router.get('/', requirePermission('exams.view'), controller.list);
  router.post('/', requirePermission('exams.manage'), controller.create);
  router.patch('/:id', requirePermission('exams.manage'), controller.update);
  router.delete('/:id', requirePermission('exams.manage'), controller.remove);

  return router;
}
