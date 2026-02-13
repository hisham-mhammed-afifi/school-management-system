import { Router } from 'express';
import type { StudentAttendanceController } from './student-attendance.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createStudentAttendanceRoutes(controller: StudentAttendanceController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('attendance.view'), controller.list);
  router.get('/summary', requirePermission('attendance.view'), controller.summary);
  router.get('/:id', requirePermission('attendance.view'), controller.getById);
  router.post('/bulk', requirePermission('attendance.record'), controller.bulkRecord);
  router.patch('/:id', requirePermission('attendance.correct'), controller.correct);

  return router;
}
