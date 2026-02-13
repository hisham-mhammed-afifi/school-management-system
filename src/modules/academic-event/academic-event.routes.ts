import { Router } from 'express';
import type { AcademicEventController } from './academic-event.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createAcademicEventRoutes(controller: AcademicEventController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('events.view'), controller.list);
  router.get('/:id', requirePermission('events.view'), controller.getById);
  router.post('/', requirePermission('events.create'), controller.create);
  router.patch('/:id', requirePermission('events.update'), controller.update);
  router.delete('/:id', requirePermission('events.delete'), controller.remove);

  return router;
}
