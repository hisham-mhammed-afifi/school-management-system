import { Router } from 'express';
import type { GradeController } from './grade.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createGradeRoutes(controller: GradeController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /grades:
   *   get:
   *     tags: [Grades]
   *     summary: List grades
   *     description: |
   *       Get a paginated list of grade levels for the current school.
   *       Grades represent academic levels (e.g., Grade 1, Grade 10, Form 3).
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *     responses:
   *       200:
   *         description: Grades retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Grade'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('grades.list'), controller.list);

  /**
   * @openapi
   * /grades/{id}:
   *   get:
   *     tags: [Grades]
   *     summary: Get a grade by ID
   *     description: Retrieve detailed information about a specific grade level.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Grade ID
   *     responses:
   *       200:
   *         description: Grade retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Grade'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('grades.read'), controller.getById);

  /**
   * @openapi
   * /grades:
   *   post:
   *     tags: [Grades]
   *     summary: Create a new grade
   *     description: Create a new grade level for the current school.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, level]
   *             properties:
   *               name:
   *                 type: string
   *                 example: 'Grade 10'
   *               level:
   *                 type: integer
   *                 example: 10
   *                 description: Numeric level for ordering
   *               capacity:
   *                 type: integer
   *                 nullable: true
   *                 description: Maximum student capacity for this grade
   *     responses:
   *       201:
   *         description: Grade created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Grade'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       409:
   *         description: Grade with this level already exists
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('grades.create'), controller.create);

  /**
   * @openapi
   * /grades/{id}:
   *   patch:
   *     tags: [Grades]
   *     summary: Update a grade
   *     description: Update grade details such as name or capacity.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Grade ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string }
   *               level: { type: integer }
   *               capacity: { type: integer, nullable: true }
   *     responses:
   *       200:
   *         description: Grade updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Grade'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('grades.update'), controller.update);

  /**
   * @openapi
   * /grades/{id}:
   *   delete:
   *     tags: [Grades]
   *     summary: Delete a grade
   *     description: Delete a grade. Cannot delete grades with class sections or students.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Grade ID
   *     responses:
   *       204:
   *         description: Grade deleted successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Cannot delete grade with associated data
   */
  router.delete('/:id', requirePermission('grades.delete'), controller.remove);

  return router;
}
