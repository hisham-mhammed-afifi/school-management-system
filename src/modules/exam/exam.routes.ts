import { Router } from 'express';
import type { ExamController } from './exam.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createExamRoutes(controller: ExamController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /exams:
   *   get:
   *     tags: [Exams]
   *     summary: List exams
   *     description: Get a paginated list of exams with filtering by term and exam type.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [createdAt, name, startDate]
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
   *         name: termId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by term ID
   *       - in: query
   *         name: examType
   *         schema:
   *           type: string
   *           enum: [quiz, midterm, final, assignment, practical]
   *         description: Filter by exam type
   *     responses:
   *       200:
   *         description: Exams retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Exam'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('exams.view'), controller.list);

  /**
   * @openapi
   * /exams/{id}:
   *   get:
   *     tags: [Exams]
   *     summary: Get an exam by ID
   *     description: Retrieve detailed information about a specific exam including subjects and grading scale.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Exam ID
   *     responses:
   *       200:
   *         description: Exam details retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Exam'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('exams.view'), controller.getById);

  /**
   * @openapi
   * /exams:
   *   post:
   *     tags: [Exams]
   *     summary: Create a new exam
   *     description: Create a new exam for a specific term and academic year.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [academicYearId, termId, gradingScaleId, name, examType]
   *             properties:
   *               academicYearId: { type: string, format: uuid }
   *               termId: { type: string, format: uuid }
   *               gradingScaleId: { type: string, format: uuid }
   *               name: { type: string, minLength: 1, maxLength: 100, example: 'Midterm Exam 2024' }
   *               examType: { type: string, enum: [quiz, midterm, final, assignment, practical] }
   *               weight: { type: number, minimum: 0, maximum: 100, default: 100, description: 'Weight percentage for final grade calculation' }
   *               startDate: { type: string, format: date }
   *               endDate: { type: string, format: date }
   *     responses:
   *       201:
   *         description: Exam created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Exam'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Academic year, term, or grading scale not found
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('exams.create'), controller.create);

  /**
   * @openapi
   * /exams/{id}:
   *   patch:
   *     tags: [Exams]
   *     summary: Update an exam
   *     description: Update exam details such as name, dates, or weight.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Exam ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string, minLength: 1, maxLength: 100 }
   *               examType: { type: string, enum: [quiz, midterm, final, assignment, practical] }
   *               weight: { type: number, minimum: 0, maximum: 100 }
   *               gradingScaleId: { type: string, format: uuid }
   *               startDate: { type: string, format: date }
   *               endDate: { type: string, format: date }
   *     responses:
   *       200:
   *         description: Exam updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Exam'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('exams.update'), controller.update);

  /**
   * @openapi
   * /exams/{id}:
   *   delete:
   *     tags: [Exams]
   *     summary: Delete an exam
   *     description: |
   *       Delete an exam. Note: Cannot delete exams that have grades already recorded.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Exam ID
   *     responses:
   *       204:
   *         description: Exam deleted successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Cannot delete exam with recorded grades
   */
  router.delete('/:id', requirePermission('exams.delete'), controller.remove);

  return router;
}
