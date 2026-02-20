import { Router } from 'express';
import type { ReportCardController } from './report-card.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createReportCardRoutes(controller: ReportCardController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /report-cards:
   *   get:
   *     tags: [Report Cards]
   *     summary: List report cards
   *     description: |
   *       Get a paginated list of report cards for the current school.
   *       Can be filtered by student, academic year, or term.
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
   *         name: academicYearId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by academic year
   *       - in: query
   *         name: termId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by term
   *     responses:
   *       200:
   *         description: Report cards retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ReportCard'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('report-cards.list'), controller.list);

  /**
   * @openapi
   * /report-cards/{id}:
   *   get:
   *     tags: [Report Cards]
   *     summary: Get a report card by ID
   *     description: |
   *       Retrieve detailed information about a specific report card,
   *       including all subject grades, GPA, and ranking.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Report card ID
   *     responses:
   *       200:
   *         description: Report card retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/ReportCard'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('report-cards.read'), controller.getById);

  /**
   * @openapi
   * /report-cards/generate:
   *   post:
   *     tags: [Report Cards]
   *     summary: Generate report cards
   *     description: |
   *       Generate report cards for students based on exam results.
   *       Calculates GPA, ranking, and aggregates all subject grades.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [academicYearId, classSectionId]
   *             properties:
   *               academicYearId:
   *                 type: string
   *                 format: uuid
   *                 description: Academic year for the report cards
   *               termId:
   *                 type: string
   *                 format: uuid
   *                 nullable: true
   *                 description: Optional term filter
   *               classSectionId:
   *                 type: string
   *                 format: uuid
   *                 description: Class section to generate report cards for
   *               publish:
   *                 type: boolean
   *                 default: false
   *                 description: Publish report cards immediately
   *     responses:
   *       201:
   *         description: Report cards generated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: object
   *                   properties:
   *                     generatedCount:
   *                       type: integer
   *                       example: 35
   *                     reportCards:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/ReportCard'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Academic year or class section not found
   *       409:
   *         description: Report cards already exist for this period
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/generate', requirePermission('report-cards.create'), controller.generate);

  /**
   * @openapi
   * /report-cards/{id}/remarks:
   *   patch:
   *     tags: [Report Cards]
   *     summary: Update report card remarks
   *     description: |
   *       Update teacher or admin remarks on a report card.
   *       Remarks provide qualitative feedback about student performance.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Report card ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [remarks]
   *             properties:
   *               remarks:
   *                 type: string
   *                 example: 'Excellent performance in all subjects. Keep up the good work!'
   *     responses:
   *       200:
   *         description: Report card remarks updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/ReportCard'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id/remarks', requirePermission('report-cards.update'), controller.updateRemarks);

  return router;
}
