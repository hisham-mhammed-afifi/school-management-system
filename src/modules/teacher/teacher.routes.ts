import { Router } from 'express';
import type { TeacherController } from './teacher.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createTeacherRoutes(controller: TeacherController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /teachers:
   *   get:
   *     tags: [Teachers]
   *     summary: List teachers
   *     description: Retrieve a paginated list of teachers with optional filtering by status, department, or search term.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - $ref: '#/components/parameters/SearchParam'
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [createdAt, firstName, lastName, teacherCode]
   *           default: createdAt
   *         description: Field to sort by
   *       - in: query
   *         name: order
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: desc
   *         description: Sort order
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [active, on_leave, resigned, terminated]
   *         description: Filter by teacher status
   *       - in: query
   *         name: departmentId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by department ID
   *     responses:
   *       200:
   *         description: Paginated list of teachers
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Teacher'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('teachers.view'), controller.list);

  /**
   * @openapi
   * /teachers/{id}:
   *   get:
   *     tags: [Teachers]
   *     summary: Get a teacher by ID
   *     description: Retrieve a single teacher record by its unique identifier.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Teacher ID
   *     responses:
   *       200:
   *         description: Teacher details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Teacher'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('teachers.view'), controller.getById);

  /**
   * @openapi
   * /teachers:
   *   post:
   *     tags: [Teachers]
   *     summary: Create a new teacher
   *     description: Create a new teacher record. Requires the teachers.create permission.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [teacherCode, firstName, lastName, gender, hireDate]
   *             properties:
   *               teacherCode: { type: string, minLength: 1, maxLength: 30, example: "TCH-001" }
   *               firstName: { type: string, minLength: 1, maxLength: 100, example: "Jane" }
   *               lastName: { type: string, minLength: 1, maxLength: 100, example: "Doe" }
   *               gender: { type: string, enum: [male, female] }
   *               nationalId: { type: string, maxLength: 30 }
   *               phone: { type: string, maxLength: 20 }
   *               email: { type: string, format: email, maxLength: 255 }
   *               specialization: { type: string, maxLength: 100 }
   *               qualification: { type: string, maxLength: 100 }
   *               photoUrl: { type: string, format: uri }
   *               hireDate: { type: string, format: date }
   *               departmentId: { type: string, format: uuid, nullable: true }
   *     responses:
   *       201:
   *         description: Teacher created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Teacher'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('teachers.create'), controller.create);

  /**
   * @openapi
   * /teachers/{id}:
   *   patch:
   *     tags: [Teachers]
   *     summary: Update a teacher
   *     description: Partially update an existing teacher record. Only provided fields will be updated.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Teacher ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               firstName: { type: string, minLength: 1, maxLength: 100 }
   *               lastName: { type: string, minLength: 1, maxLength: 100 }
   *               gender: { type: string, enum: [male, female] }
   *               nationalId: { type: string, maxLength: 30, nullable: true }
   *               phone: { type: string, maxLength: 20, nullable: true }
   *               email: { type: string, format: email, maxLength: 255, nullable: true }
   *               specialization: { type: string, maxLength: 100, nullable: true }
   *               qualification: { type: string, maxLength: 100, nullable: true }
   *               photoUrl: { type: string, format: uri, nullable: true }
   *               departmentId: { type: string, format: uuid, nullable: true }
   *               status: { type: string, enum: [active, on_leave, resigned, terminated] }
   *     responses:
   *       200:
   *         description: Teacher updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Teacher'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('teachers.update'), controller.update);

  /**
   * @openapi
   * /teachers/{id}:
   *   delete:
   *     tags: [Teachers]
   *     summary: Delete a teacher
   *     description: Permanently delete a teacher record. Requires the teachers.delete permission.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Teacher ID
   *     responses:
   *       204:
   *         description: Teacher deleted successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.delete('/:id', requirePermission('teachers.delete'), controller.remove);

  // Subject assignments

  /**
   * @openapi
   * /teachers/{id}/subjects:
   *   get:
   *     tags: [Teachers]
   *     summary: Get subjects assigned to a teacher
   *     description: Retrieve the list of subjects currently assigned to a specific teacher.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Teacher ID
   *     responses:
   *       200:
   *         description: List of assigned subjects
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id: { type: string, format: uuid }
   *                       name: { type: string }
   *                       code: { type: string }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id/subjects', requirePermission('teachers.view'), controller.getSubjects);

  /**
   * @openapi
   * /teachers/{id}/subjects:
   *   put:
   *     tags: [Teachers]
   *     summary: Assign subjects to a teacher
   *     description: Replace the full set of subjects assigned to a teacher. Pass an empty array to remove all assignments.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Teacher ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [subjectIds]
   *             properties:
   *               subjectIds:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: uuid
   *                 description: Array of subject IDs to assign
   *     responses:
   *       200:
   *         description: Subjects assigned successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id: { type: string, format: uuid }
   *                       name: { type: string }
   *                       code: { type: string }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.put('/:id/subjects', requirePermission('teachers.update'), controller.assignSubjects);

  return router;
}
