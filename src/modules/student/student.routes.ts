import { Router } from 'express';
import type { StudentController } from './student.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createStudentRoutes(controller: StudentController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /students:
   *   get:
   *     tags: [Students]
   *     summary: List students with pagination and filters
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - $ref: '#/components/parameters/SearchParam'
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [createdAt, firstName, lastName, studentCode]
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
   *           enum: [active, graduated, withdrawn, suspended, transferred]
   *         description: Filter by student status
   *       - in: query
   *         name: gradeId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by grade ID
   *       - in: query
   *         name: classSectionId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by class section ID
   *     responses:
   *       200:
   *         description: Paginated list of students
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Student'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('students.list'), controller.list);

  /**
   * @openapi
   * /students/{id}:
   *   get:
   *     tags: [Students]
   *     summary: Get a student by ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Student ID
   *     responses:
   *       200:
   *         description: Student details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Student'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('students.read'), controller.getById);

  /**
   * @openapi
   * /students:
   *   post:
   *     tags: [Students]
   *     summary: Create a new student
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [studentCode, firstName, lastName, dateOfBirth, gender, admissionDate]
   *             properties:
   *               studentCode: { type: string, minLength: 1, maxLength: 30 }
   *               firstName: { type: string, minLength: 1, maxLength: 100 }
   *               lastName: { type: string, minLength: 1, maxLength: 100 }
   *               dateOfBirth: { type: string, format: date }
   *               gender: { type: string, enum: [male, female] }
   *               nationalId: { type: string, maxLength: 30 }
   *               nationality: { type: string, maxLength: 50 }
   *               religion: { type: string, maxLength: 50 }
   *               bloodType: { type: string, enum: [A_POS, A_NEG, B_POS, B_NEG, AB_POS, AB_NEG, O_POS, O_NEG] }
   *               address: { type: string }
   *               phone: { type: string, maxLength: 20 }
   *               email: { type: string, format: email, maxLength: 255 }
   *               photoUrl: { type: string, format: uri }
   *               medicalNotes: { type: string }
   *               admissionDate: { type: string, format: date }
   *     responses:
   *       201:
   *         description: Student created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Student'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       409:
   *         description: Student code already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('students.create'), controller.create);

  /**
   * @openapi
   * /students/{id}:
   *   patch:
   *     tags: [Students]
   *     summary: Update a student
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Student ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               firstName: { type: string, minLength: 1, maxLength: 100 }
   *               lastName: { type: string, minLength: 1, maxLength: 100 }
   *               dateOfBirth: { type: string, format: date }
   *               gender: { type: string, enum: [male, female] }
   *               nationalId: { type: string, maxLength: 30, nullable: true }
   *               nationality: { type: string, maxLength: 50, nullable: true }
   *               religion: { type: string, maxLength: 50, nullable: true }
   *               bloodType: { type: string, enum: [A_POS, A_NEG, B_POS, B_NEG, AB_POS, AB_NEG, O_POS, O_NEG], nullable: true }
   *               address: { type: string, nullable: true }
   *               phone: { type: string, maxLength: 20, nullable: true }
   *               email: { type: string, format: email, maxLength: 255, nullable: true }
   *               photoUrl: { type: string, format: uri, nullable: true }
   *               medicalNotes: { type: string, nullable: true }
   *               status: { type: string, enum: [active, graduated, withdrawn, suspended, transferred] }
   *     responses:
   *       200:
   *         description: Student updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Student'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('students.update'), controller.update);

  /**
   * @openapi
   * /students/{id}:
   *   delete:
   *     tags: [Students]
   *     summary: Delete a student
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Student ID
   *     responses:
   *       204:
   *         description: Student deleted
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.delete('/:id', requirePermission('students.delete'), controller.remove);

  return router;
}
