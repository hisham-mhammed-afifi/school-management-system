import { Router } from 'express';
import type { UserController } from './user.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createUserRoutes(controller: UserController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('users.view'), controller.list);
  router.get('/:id', requirePermission('users.view'), controller.getById);
  router.post('/', requirePermission('users.create'), controller.create);
  router.patch('/:id', requirePermission('users.update'), controller.update);
  router.delete('/:id', requirePermission('users.delete'), controller.remove);
  router.post('/:id/roles', requirePermission('users.manage_roles'), controller.assignRole);
  router.delete('/:id/roles/:roleId', requirePermission('users.manage_roles'), controller.removeRole);

  return router;
}
