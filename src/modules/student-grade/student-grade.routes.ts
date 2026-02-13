import { Router } from 'express';
import type { StudentGradeController } from './student-grade.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createStudentGradeRoutes(controller: StudentGradeController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('grades_entry.view'), controller.list);
  router.get('/report', requirePermission('grades_entry.view'), controller.report);
  router.post('/bulk', requirePermission('grades_entry.record'), controller.bulkRecord);
  router.patch('/:id', requirePermission('grades_entry.update'), controller.correct);

  return router;
}
