import { Router } from 'express';
import type { RoleController } from './role.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createRoleRoutes(controller: RoleController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('roles.view'), controller.list);
  router.get('/:id', requirePermission('roles.view'), controller.getById);
  router.post('/', requirePermission('roles.create'), controller.create);
  router.patch('/:id', requirePermission('roles.update'), controller.update);
  router.delete('/:id', requirePermission('roles.delete'), controller.remove);
  router.put('/:id/permissions', requirePermission('roles.manage_permissions'), controller.setPermissions);

  return router;
}
