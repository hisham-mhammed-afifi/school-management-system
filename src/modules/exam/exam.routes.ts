import { Router } from 'express';
import type { ExamController } from './exam.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createExamRoutes(controller: ExamController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('exams.view'), controller.list);
  router.get('/:id', requirePermission('exams.view'), controller.getById);
  router.post('/', requirePermission('exams.create'), controller.create);
  router.patch('/:id', requirePermission('exams.update'), controller.update);
  router.delete('/:id', requirePermission('exams.delete'), controller.remove);

  return router;
}
