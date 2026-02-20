import { Router } from 'express';
import type { SubjectController } from './subject.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createSubjectRoutes(controller: SubjectController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /subjects:
   *   get:
   *     tags: [Subjects]
   *     summary: List subjects
   *     description: Get a paginated list of subjects for the current school.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *           enum: [core, elective, vocational]
   *         description: Filter by subject category
   *       - in: query
   *         name: departmentId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by department
   *     responses:
   *       200:
   *         description: Subjects retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Subject'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('subjects.list'), controller.list);

  /**
   * @openapi
   * /subjects/{id}:
   *   get:
   *     tags: [Subjects]
   *     summary: Get a subject by ID
   *     description: Retrieve detailed information about a specific subject.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Subject ID
   *     responses:
   *       200:
   *         description: Subject retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Subject'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('subjects.read'), controller.getById);

  /**
   * @openapi
   * /subjects:
   *   post:
   *     tags: [Subjects]
   *     summary: Create a new subject
   *     description: Create a new subject for the current school.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, code]
   *             properties:
   *               name:
   *                 type: string
   *                 example: 'Mathematics'
   *               code:
   *                 type: string
   *                 example: 'MATH101'
   *               category:
   *                 type: string
   *                 enum: [core, elective, vocational]
   *               description:
   *                 type: string
   *                 maxLength: 500
   *               departmentId:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       201:
   *         description: Subject created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Subject'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       409:
   *         description: Subject with this code already exists
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('subjects.create'), controller.create);

  /**
   * @openapi
   * /subjects/{id}:
   *   patch:
   *     tags: [Subjects]
   *     summary: Update a subject
   *     description: Update subject details such as name, category, or department.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Subject ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string }
   *               code: { type: string }
   *               category: { type: string, enum: [core, elective, vocational] }
   *               description: { type: string, maxLength: 500 }
   *               departmentId: { type: string, format: uuid, nullable: true }
   *     responses:
   *       200:
   *         description: Subject updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Subject'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('subjects.update'), controller.update);

  /**
   * @openapi
   * /subjects/{id}:
   *   delete:
   *     tags: [Subjects]
   *     summary: Delete a subject
   *     description: Delete a subject. Cannot delete subjects assigned to lessons or grade requirements.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Subject ID
   *     responses:
   *       204:
   *         description: Subject deleted successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Cannot delete subject with associated data
   */
  router.delete('/:id', requirePermission('subjects.delete'), controller.remove);

  /**
   * @openapi
   * /subjects/{subjectId}/grades:
   *   put:
   *     tags: [Subjects]
   *     summary: Assign grades to a subject
   *     description: |
   *       Set which grade levels this subject is available for.
   *       Replaces existing grade assignments.
   *     parameters:
   *       - in: path
   *         name: subjectId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Subject ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [gradeIds]
   *             properties:
   *               gradeIds:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: uuid
   *                 description: Array of grade IDs
   *     responses:
   *       200:
   *         description: Grades assigned successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: object
   *                   properties:
   *                     subjectId: { type: string, format: uuid }
   *                     assignedCount: { type: integer }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.put('/:subjectId/grades', requirePermission('subjects.update'), controller.setGrades);

  return router;
}

export function createGradeSubjectsRoutes(controller: SubjectController): Router {
  // Mounted at /grades/:gradeId/subjects
  const router = Router({ mergeParams: true });

  router.use(authenticate);

  /**
   * @openapi
   * /grades/{gradeId}/subjects:
   *   get:
   *     tags: [Subjects]
   *     summary: Get subjects for a grade
   *     description: Retrieve all subjects available for a specific grade level.
   *     parameters:
   *       - in: path
   *         name: gradeId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Grade ID
   *     responses:
   *       200:
   *         description: Subjects retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Subject'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Grade not found
   */
  router.get('/', requirePermission('subjects.list'), controller.getByGrade);

  return router;
}
