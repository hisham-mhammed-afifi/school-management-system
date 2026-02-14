import { Router } from 'express';
import type { UserController } from './user.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createUserRoutes(controller: UserController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /users:
   *   get:
   *     tags: [Users]
   *     summary: List users with pagination and filtering
   *     parameters:
   *       - in: query
   *         name: page
   *         schema: { type: integer, default: 1, minimum: 1 }
   *       - in: query
   *         name: limit
   *         schema: { type: integer, default: 20, minimum: 1, maximum: 100 }
   *       - in: query
   *         name: sortBy
   *         schema: { type: string, enum: [createdAt, email, lastLoginAt], default: createdAt }
   *       - in: query
   *         name: order
   *         schema: { type: string, enum: [asc, desc], default: desc }
   *       - in: query
   *         name: roleId
   *         schema: { type: string, format: uuid }
   *       - in: query
   *         name: isActive
   *         schema: { type: string, enum: ['true', 'false'] }
   *       - in: query
   *         name: search
   *         schema: { type: string, maxLength: 255 }
   *     responses:
   *       200:
   *         description: Paginated list of users
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items: { $ref: '#/components/schemas/UserResponse' }
   *                 meta:
   *                   type: object
   *                   properties:
   *                     page: { type: integer }
   *                     limit: { type: integer }
   *                     total: { type: integer }
   *                     totalPages: { type: integer }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.get('/', requirePermission('users.view'), controller.list);

  /**
   * @openapi
   * /users/{id}:
   *   get:
   *     tags: [Users]
   *     summary: Get a user by ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     responses:
   *       200:
   *         description: User details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data: { $ref: '#/components/schemas/UserResponse' }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         description: User not found
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.get('/:id', requirePermission('users.view'), controller.getById);

  /**
   * @openapi
   * /users:
   *   post:
   *     tags: [Users]
   *     summary: Create a new user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [email, password, roleIds]
   *             properties:
   *               email: { type: string, format: email, maxLength: 255 }
   *               phone: { type: string, maxLength: 20 }
   *               password: { type: string, minLength: 8, maxLength: 128 }
   *               teacherId: { type: string, format: uuid }
   *               studentId: { type: string, format: uuid }
   *               guardianId: { type: string, format: uuid }
   *               roleIds:
   *                 type: array
   *                 items: { type: string, format: uuid }
   *                 minItems: 1
   *     responses:
   *       201:
   *         description: User created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data: { $ref: '#/components/schemas/UserResponse' }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       409:
   *         description: Email already in use
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('users.create'), controller.create);

  /**
   * @openapi
   * /users/{id}:
   *   patch:
   *     tags: [Users]
   *     summary: Update a user
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email: { type: string, format: email, maxLength: 255 }
   *               phone: { type: string, maxLength: 20 }
   *               isActive: { type: boolean }
   *     responses:
   *       200:
   *         description: User updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data: { $ref: '#/components/schemas/UserResponse' }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         description: User not found
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('users.update'), controller.update);

  /**
   * @openapi
   * /users/{id}:
   *   delete:
   *     tags: [Users]
   *     summary: Deactivate a user
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     responses:
   *       204:
   *         description: User deactivated
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         description: User not found
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.delete('/:id', requirePermission('users.delete'), controller.remove);

  /**
   * @openapi
   * /users/{id}/roles:
   *   post:
   *     tags: [Users]
   *     summary: Assign a role to a user
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [roleId]
   *             properties:
   *               roleId: { type: string, format: uuid }
   *               schoolId: { type: string, format: uuid }
   *     responses:
   *       200:
   *         description: Role assigned
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data: { $ref: '#/components/schemas/UserResponse' }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         description: User or role not found
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/:id/roles', requirePermission('users.manage_roles'), controller.assignRole);

  /**
   * @openapi
   * /users/{id}/roles/{roleId}:
   *   delete:
   *     tags: [Users]
   *     summary: Remove a role from a user
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string, format: uuid }
   *       - in: path
   *         name: roleId
   *         required: true
   *         schema: { type: string, format: uuid }
   *       - in: query
   *         name: schoolId
   *         schema: { type: string, format: uuid }
   *         description: Optional school scope for the role removal
   *     responses:
   *       200:
   *         description: Role removed
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data: { $ref: '#/components/schemas/UserResponse' }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         description: User or role assignment not found
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.delete('/:id/roles/:roleId', requirePermission('users.manage_roles'), controller.removeRole);

  return router;
}
