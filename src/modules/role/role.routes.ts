import { Router } from 'express';
import type { RoleController } from './role.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createRoleRoutes(controller: RoleController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /roles:
   *   get:
   *     tags: [Roles]
   *     summary: List roles
   *     description: |
   *       Get a paginated list of roles for the current school.
   *       Includes both custom school roles and system-wide roles.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - $ref: '#/components/parameters/SearchParam'
   *     responses:
   *       200:
   *         description: Roles retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Role'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('roles.view'), controller.list);

  /**
   * @openapi
   * /roles/{id}:
   *   get:
   *     tags: [Roles]
   *     summary: Get a role by ID
   *     description: Retrieve detailed information about a specific role including its assigned permissions.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Role ID
   *     responses:
   *       200:
   *         description: Role details retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Role'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('roles.view'), controller.getById);

  /**
   * @openapi
   * /roles:
   *   post:
   *     tags: [Roles]
   *     summary: Create a new role
   *     description: Create a new custom role for the current school.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name]
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 100
   *                 example: 'Department Head'
   *                 description: Role name (must be unique within the school)
   *     responses:
   *       201:
   *         description: Role created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Role'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       409:
   *         description: Role name already exists in this school
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('roles.create'), controller.create);

  /**
   * @openapi
   * /roles/{id}:
   *   patch:
   *     tags: [Roles]
   *     summary: Update a role
   *     description: |
   *       Update a role's name. Note: System roles (isSystem: true) cannot be updated.
   *       Only custom school roles can be modified.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Role ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name]
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 100
   *                 example: 'Senior Department Head'
   *     responses:
   *       200:
   *         description: Role updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Role'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Cannot update system roles or forbidden by permissions
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Role name already exists in this school
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('roles.update'), controller.update);

  /**
   * @openapi
   * /roles/{id}:
   *   delete:
   *     tags: [Roles]
   *     summary: Delete a role
   *     description: |
   *       Delete a custom role. Note:
   *       - System roles (isSystem: true) cannot be deleted
   *       - Cannot delete roles that are currently assigned to users
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Role ID
   *     responses:
   *       204:
   *         description: Role deleted successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Cannot delete system roles or forbidden by permissions
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Role is currently assigned to users
   */
  router.delete('/:id', requirePermission('roles.delete'), controller.remove);

  /**
   * @openapi
   * /roles/{id}/permissions:
   *   put:
   *     tags: [Roles]
   *     summary: Set role permissions
   *     description: |
   *       Replace all permissions for a role with a new set.
   *       This is a full replacement operation - any permissions not included will be removed.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Role ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [permissionIds]
   *             properties:
   *               permissionIds:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: uuid
   *                 description: Array of permission IDs to assign to this role
   *                 example: ['uuid-1', 'uuid-2', 'uuid-3']
   *     responses:
   *       200:
   *         description: Permissions updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Role'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Role or one or more permissions not found
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.put('/:id/permissions', requirePermission('roles.manage_permissions'), controller.setPermissions);

  return router;
}
