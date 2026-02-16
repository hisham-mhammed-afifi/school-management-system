import { Router } from 'express';
import type { DepartmentController } from './department.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createDepartmentRoutes(controller: DepartmentController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /departments:
   *   get:
   *     tags: [Departments]
   *     summary: List departments
   *     description: Get a paginated list of departments for the current school.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *     responses:
   *       200:
   *         description: Departments retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Department'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('departments.view'), controller.list);

  /**
   * @openapi
   * /departments/{id}:
   *   get:
   *     tags: [Departments]
   *     summary: Get a department by ID
   *     description: Retrieve detailed information about a specific department.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Department ID
   *     responses:
   *       200:
   *         description: Department retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Department'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('departments.view'), controller.getById);

  /**
   * @openapi
   * /departments:
   *   post:
   *     tags: [Departments]
   *     summary: Create a new department
   *     description: Create a new department for the current school.
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
   *                 example: 'Science Department'
   *               code:
   *                 type: string
   *                 example: 'SCI'
   *               description:
   *                 type: string
   *                 maxLength: 500
   *               headOfDepartment:
   *                 type: string
   *                 format: uuid
   *                 description: Teacher ID who leads this department
   *     responses:
   *       201:
   *         description: Department created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Department'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       409:
   *         description: Department with this name or code already exists
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('departments.create'), controller.create);

  /**
   * @openapi
   * /departments/{id}:
   *   patch:
   *     tags: [Departments]
   *     summary: Update a department
   *     description: Update department details such as name, code, or head of department.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Department ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string }
   *               code: { type: string }
   *               description: { type: string, maxLength: 500 }
   *               headOfDepartment: { type: string, format: uuid, nullable: true }
   *     responses:
   *       200:
   *         description: Department updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Department'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('departments.update'), controller.update);

  /**
   * @openapi
   * /departments/{id}:
   *   delete:
   *     tags: [Departments]
   *     summary: Delete a department
   *     description: Delete a department. Cannot delete departments with associated teachers or subjects.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Department ID
   *     responses:
   *       204:
   *         description: Department deleted successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Cannot delete department with associated data
   */
  router.delete('/:id', requirePermission('departments.update'), controller.remove);

  return router;
}
