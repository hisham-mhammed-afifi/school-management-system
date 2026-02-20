import { Router } from 'express';
import type { GradingScaleController } from './grading-scale.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createGradingScaleRoutes(controller: GradingScaleController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /grading-scales:
   *   get:
   *     tags: [Exams]
   *     summary: List grading scales
   *     description: |
   *       Get a list of grading scales for the current school.
   *       Grading scales define letter grades, score ranges, and GPA mappings.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *     responses:
   *       200:
   *         description: Grading scales retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/GradingScale'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('grading-scales.list'), controller.list);

  /**
   * @openapi
   * /grading-scales/{id}:
   *   get:
   *     tags: [Exams]
   *     summary: Get a grading scale by ID
   *     description: |
   *       Retrieve detailed information about a specific grading scale,
   *       including all grade definitions (A, B, C, etc).
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Grading scale ID
   *     responses:
   *       200:
   *         description: Grading scale retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/GradingScale'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('grading-scales.read'), controller.getById);

  /**
   * @openapi
   * /grading-scales:
   *   post:
   *     tags: [Exams]
   *     summary: Create a new grading scale
   *     description: |
   *       Create a new grading scale with grade definitions.
   *       Grading scales map score ranges to letter grades and GPAs.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, minPassingScore, grades]
   *             properties:
   *               name:
   *                 type: string
   *                 example: 'Standard Grading'
   *               minPassingScore:
   *                 type: number
   *                 example: 60
   *                 description: Minimum score to pass
   *               grades:
   *                 type: array
   *                 description: Array of grade definitions
   *                 items:
   *                   type: object
   *                   required: [letter, minScore, maxScore]
   *                   properties:
   *                     letter:
   *                       type: string
   *                       example: 'A'
   *                     minScore:
   *                       type: number
   *                       example: 90
   *                     maxScore:
   *                       type: number
   *                       example: 100
   *                     gpa:
   *                       type: number
   *                       example: 4.0
   *                       nullable: true
   *                     description:
   *                       type: string
   *                       example: 'Excellent'
   *                       nullable: true
   *     responses:
   *       201:
   *         description: Grading scale created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/GradingScale'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       409:
   *         description: Grading scale with this name already exists
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('grading-scales.create'), controller.create);

  /**
   * @openapi
   * /grading-scales/{id}:
   *   patch:
   *     tags: [Exams]
   *     summary: Update a grading scale
   *     description: Update grading scale details such as name, passing score, or grade definitions.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Grading scale ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string }
   *               minPassingScore: { type: number }
   *               grades:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     letter: { type: string }
   *                     minScore: { type: number }
   *                     maxScore: { type: number }
   *                     gpa: { type: number, nullable: true }
   *                     description: { type: string, nullable: true }
   *     responses:
   *       200:
   *         description: Grading scale updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/GradingScale'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('grading-scales.update'), controller.update);

  /**
   * @openapi
   * /grading-scales/{id}:
   *   delete:
   *     tags: [Exams]
   *     summary: Delete a grading scale
   *     description: Delete a grading scale. Cannot delete scales used in exams or report cards.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Grading scale ID
   *     responses:
   *       204:
   *         description: Grading scale deleted successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Cannot delete grading scale with associated data
   */
  router.delete('/:id', requirePermission('grading-scales.delete'), controller.remove);

  return router;
}
