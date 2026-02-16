import { Router } from 'express';
import type { ClassSectionController } from './class-section.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createClassSectionRoutes(controller: ClassSectionController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /class-sections:
   *   get:
   *     tags: [Class Sections]
   *     summary: List class sections
   *     description: |
   *       Get a paginated list of class sections for the current school.
   *       Class sections are divisions within a grade (e.g., Grade 10 Section A, Grade 10 Section B).
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - in: query
   *         name: gradeId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by grade
   *     responses:
   *       200:
   *         description: Class sections retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ClassSection'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('class_sections.view'), controller.list);

  /**
   * @openapi
   * /class-sections/{id}:
   *   get:
   *     tags: [Class Sections]
   *     summary: Get a class section by ID
   *     description: Retrieve detailed information about a specific class section.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Class section ID
   *     responses:
   *       200:
   *         description: Class section retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/ClassSection'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('class_sections.view'), controller.getById);

  /**
   * @openapi
   * /class-sections:
   *   post:
   *     tags: [Class Sections]
   *     summary: Create a new class section
   *     description: Create a new class section within a grade.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [gradeId, name]
   *             properties:
   *               gradeId:
   *                 type: string
   *                 format: uuid
   *                 description: Grade this section belongs to
   *               name:
   *                 type: string
   *                 example: 'Section A'
   *               capacity:
   *                 type: integer
   *                 example: 40
   *                 description: Maximum number of students
   *               roomId:
   *                 type: string
   *                 format: uuid
   *                 nullable: true
   *                 description: Primary classroom for this section
   *     responses:
   *       201:
   *         description: Class section created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/ClassSection'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Grade or room not found
   *       409:
   *         description: Section with this name already exists for this grade
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('class_sections.create'), controller.create);

  /**
   * @openapi
   * /class-sections/{id}:
   *   patch:
   *     tags: [Class Sections]
   *     summary: Update a class section
   *     description: Update class section details such as name, capacity, or room assignment.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Class section ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string }
   *               capacity: { type: integer }
   *               roomId: { type: string, format: uuid, nullable: true }
   *     responses:
   *       200:
   *         description: Class section updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/ClassSection'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('class_sections.update'), controller.update);

  /**
   * @openapi
   * /class-sections/{id}:
   *   delete:
   *     tags: [Class Sections]
   *     summary: Delete a class section
   *     description: Delete a class section. Cannot delete sections with enrolled students or lessons.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Class section ID
   *     responses:
   *       204:
   *         description: Class section deleted successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Cannot delete section with associated data
   */
  router.delete('/:id', requirePermission('class_sections.delete'), controller.remove);

  return router;
}
