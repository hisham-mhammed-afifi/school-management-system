import { Router } from 'express';
import type { StudentGradeController } from './student-grade.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createStudentGradeRoutes(controller: StudentGradeController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /student-grades:
   *   get:
   *     tags: [Student Grades]
   *     summary: List student grades
   *     description: |
   *       Get a paginated list of student grades for the current school.
   *       Can be filtered by student, exam, subject, or class section.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - in: query
   *         name: studentId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by student
   *       - in: query
   *         name: examId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by exam
   *       - in: query
   *         name: examSubjectId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by exam subject
   *     responses:
   *       200:
   *         description: Student grades retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/StudentGrade'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('student-grades.list'), controller.list);

  /**
   * @openapi
   * /student-grades/report:
   *   get:
   *     tags: [Student Grades]
   *     summary: Generate grade report
   *     description: |
   *       Generate a comprehensive grade report for an exam or class section.
   *       Includes student names, scores, grades, and statistics.
   *     parameters:
   *       - in: query
   *         name: examId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Exam ID
   *       - in: query
   *         name: classSectionId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by class section
   *     responses:
   *       200:
   *         description: Grade report generated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: object
   *                   properties:
   *                     examName: { type: string, example: 'Midterm Exam 2024' }
   *                     totalStudents: { type: integer, example: 45 }
   *                     averageScore: { type: number, example: 78.5 }
   *                     passRate: { type: number, example: 92.5, description: 'Percentage of students who passed' }
   *                     grades:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/StudentGrade'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Exam not found
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.get('/report', requirePermission('student-grades.list'), controller.report);

  /**
   * @openapi
   * /student-grades/bulk:
   *   post:
   *     tags: [Student Grades]
   *     summary: Bulk record student grades
   *     description: |
   *       Record grades for multiple students in a single request.
   *       Useful for batch grade entry after exams.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [grades]
   *             properties:
   *               grades:
   *                 type: array
   *                 description: Array of student grades to record
   *                 items:
   *                   type: object
   *                   required: [examSubjectId, studentId, score]
   *                   properties:
   *                     examSubjectId:
   *                       type: string
   *                       format: uuid
   *                       description: Exam subject this grade is for
   *                     studentId:
   *                       type: string
   *                       format: uuid
   *                       description: Student receiving the grade
   *                     score:
   *                       type: number
   *                       example: 85.5
   *                       description: Score obtained by student
   *                     remarks:
   *                       type: string
   *                       nullable: true
   *                       description: Optional remarks or feedback
   *     responses:
   *       201:
   *         description: Grades recorded successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: object
   *                   properties:
   *                     recordedCount:
   *                       type: integer
   *                       example: 35
   *                     grades:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/StudentGrade'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Exam subject or student not found
   *       409:
   *         description: Grade already exists for this student and exam subject
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/bulk', requirePermission('student-grades.create'), controller.bulkRecord);

  /**
   * @openapi
   * /student-grades/{id}:
   *   patch:
   *     tags: [Student Grades]
   *     summary: Correct a student grade
   *     description: |
   *       Update a previously recorded grade to correct errors.
   *       Used for grade corrections or adjustments.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Student grade ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               score: { type: number }
   *               remarks: { type: string }
   *     responses:
   *       200:
   *         description: Grade corrected successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/StudentGrade'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('student-grades.update'), controller.correct);

  return router;
}
