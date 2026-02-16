import { Router } from 'express';
import type { ExamSubjectController } from './exam-subject.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createExamSubjectRoutes(controller: ExamSubjectController): Router {
  const router = Router({ mergeParams: true });

  router.use(authenticate);

  /**
   * @openapi
   * /exams/{examId}/subjects:
   *   get:
   *     tags: [Exams]
   *     summary: List exam subjects
   *     description: |
   *       Get all subjects configured for a specific exam.
   *       Each exam subject defines max marks, passing marks, and weight.
   *     parameters:
   *       - in: path
   *         name: examId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Exam ID
   *     responses:
   *       200:
   *         description: Exam subjects retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ExamSubject'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Exam not found
   */
  router.get('/', requirePermission('exams.view'), controller.list);

  /**
   * @openapi
   * /exams/{examId}/subjects:
   *   post:
   *     tags: [Exams]
   *     summary: Add a subject to an exam
   *     description: |
   *       Add a subject to an exam with max marks, passing marks, and weight.
   *       This defines how the subject will be assessed in the exam.
   *     parameters:
   *       - in: path
   *         name: examId
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
   *             required: [subjectId, maxMarks, passingMarks]
   *             properties:
   *               subjectId:
   *                 type: string
   *                 format: uuid
   *                 description: Subject to add to the exam
   *               maxMarks:
   *                 type: number
   *                 example: 100
   *                 description: Maximum marks for this subject
   *               passingMarks:
   *                 type: number
   *                 example: 40
   *                 description: Minimum marks required to pass
   *               weight:
   *                 type: number
   *                 example: 1.0
   *                 default: 1.0
   *                 description: Weight of this subject in overall exam results
   *     responses:
   *       201:
   *         description: Subject added to exam successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/ExamSubject'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Exam or subject not found
   *       409:
   *         description: Subject already added to this exam
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('exams.manage'), controller.create);

  /**
   * @openapi
   * /exams/{examId}/subjects/{id}:
   *   patch:
   *     tags: [Exams]
   *     summary: Update an exam subject
   *     description: Update exam subject details such as max marks, passing marks, or weight.
   *     parameters:
   *       - in: path
   *         name: examId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Exam ID
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Exam subject ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               maxMarks: { type: number }
   *               passingMarks: { type: number }
   *               weight: { type: number }
   *     responses:
   *       200:
   *         description: Exam subject updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/ExamSubject'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('exams.manage'), controller.update);

  /**
   * @openapi
   * /exams/{examId}/subjects/{id}:
   *   delete:
   *     tags: [Exams]
   *     summary: Remove a subject from an exam
   *     description: |
   *       Remove a subject from an exam.
   *       Cannot remove subjects with existing student grades.
   *     parameters:
   *       - in: path
   *         name: examId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Exam ID
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Exam subject ID
   *     responses:
   *       204:
   *         description: Subject removed from exam successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Cannot remove subject with existing grades
   */
  router.delete('/:id', requirePermission('exams.manage'), controller.remove);

  return router;
}
