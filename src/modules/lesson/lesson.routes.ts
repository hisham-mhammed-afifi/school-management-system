import { Router } from 'express';
import type { LessonController } from './lesson.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createLessonRoutes(controller: LessonController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('lessons.view'), controller.list);
  router.get('/:id', requirePermission('lessons.view'), controller.getById);
  router.post('/', requirePermission('lessons.create'), controller.create);
  router.post('/bulk-create', requirePermission('lessons.create'), controller.bulkCreate);
  router.post('/auto-generate', requirePermission('lessons.generate'), controller.autoGenerate);
  router.delete('/clear', requirePermission('lessons.delete'), controller.clear);
  router.patch('/:id', requirePermission('lessons.update'), controller.update);
  router.post('/:id/cancel', requirePermission('lessons.cancel'), controller.cancel);

  return router;
}

export function createTimetableRoutes(controller: LessonController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/class/:classSectionId', requirePermission('lessons.view'), controller.timetableByClass);
  router.get('/teacher/:teacherId', requirePermission('lessons.view'), controller.timetableByTeacher);
  router.get('/room/:roomId', requirePermission('lessons.view'), controller.timetableByRoom);

  return router;
}
