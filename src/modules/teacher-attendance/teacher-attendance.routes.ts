import { Router } from 'express';
import type { TeacherAttendanceController } from './teacher-attendance.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createTeacherAttendanceRoutes(controller: TeacherAttendanceController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('attendance.view'), controller.list);
  router.get('/:id', requirePermission('attendance.view'), controller.getById);
  router.post('/', requirePermission('attendance.record'), controller.record);
  router.patch('/:id', requirePermission('attendance.correct'), controller.correct);

  return router;
}
