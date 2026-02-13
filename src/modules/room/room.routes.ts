import { Router } from 'express';
import type { RoomController } from './room.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createRoomRoutes(controller: RoomController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('rooms.view'), controller.list);
  router.get('/:id', requirePermission('rooms.view'), controller.getById);
  router.post('/', requirePermission('rooms.create'), controller.create);
  router.patch('/:id', requirePermission('rooms.update'), controller.update);
  router.delete('/:id', requirePermission('rooms.delete'), controller.remove);

  // Subject suitability
  router.get('/:roomId/subjects', requirePermission('rooms.view'), controller.getSubjects);
  router.put('/:roomId/subjects', requirePermission('rooms.manage'), controller.assignSubjects);

  return router;
}
