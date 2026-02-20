import { Router } from 'express';
import type { TeacherAttendanceController } from './teacher-attendance.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createTeacherAttendanceRoutes(controller: TeacherAttendanceController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('teacher-attendance.list'), controller.list);
  router.get('/:id', requirePermission('teacher-attendance.read'), controller.getById);
  router.post('/', requirePermission('teacher-attendance.create'), controller.record);
  router.patch('/:id', requirePermission('teacher-attendance.update'), controller.correct);

  return router;
}
