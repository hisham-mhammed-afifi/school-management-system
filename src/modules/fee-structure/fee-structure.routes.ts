import { Router } from 'express';
import type { FeeStructureController } from './fee-structure.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createFeeStructureRoutes(controller: FeeStructureController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /fee-structures:
   *   get:
   *     tags: [Fees]
   *     summary: List fee structures
   *     description: |
   *       Get a list of fee structures for the current school.
   *       Fee structures define which fee categories apply to specific grades and academic years.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - in: query
   *         name: gradeId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by grade
   *       - in: query
   *         name: academicYearId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by academic year
   *       - in: query
   *         name: isActive
   *         schema:
   *           type: boolean
   *         description: Filter by active status
   *     responses:
   *       200:
   *         description: Fee structures retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/FeeStructure'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('fees.view'), controller.list);

  /**
   * @openapi
   * /fee-structures:
   *   post:
   *     tags: [Fees]
   *     summary: Create a new fee structure
   *     description: |
   *       Create a new fee structure for a specific grade and academic year.
   *       Fee structures link multiple fee categories to a grade.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, gradeId, academicYearId, feeCategories]
   *             properties:
   *               name:
   *                 type: string
   *                 example: 'Grade 10 Fee Structure 2024'
   *               gradeId:
   *                 type: string
   *                 format: uuid
   *                 description: Grade this structure applies to
   *               academicYearId:
   *                 type: string
   *                 format: uuid
   *                 description: Academic year this structure applies to
   *               termId:
   *                 type: string
   *                 format: uuid
   *                 nullable: true
   *                 description: Optional term filter
   *               feeCategories:
   *                 type: array
   *                 description: Array of fee category IDs and amounts
   *                 items:
   *                   type: object
   *                   required: [feeCategoryId, amount]
   *                   properties:
   *                     feeCategoryId:
   *                       type: string
   *                       format: uuid
   *                     amount:
   *                       type: number
   *                       example: 5000.00
   *               isActive:
   *                 type: boolean
   *                 default: true
   *     responses:
   *       201:
   *         description: Fee structure created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/FeeStructure'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Grade, academic year, or fee category not found
   *       409:
   *         description: Fee structure already exists for this grade and academic year
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('fees.manage'), controller.create);

  /**
   * @openapi
   * /fee-structures/{id}:
   *   patch:
   *     tags: [Fees]
   *     summary: Update a fee structure
   *     description: Update fee structure details such as name, active status, or fee categories.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Fee structure ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string }
   *               termId: { type: string, format: uuid, nullable: true }
   *               isActive: { type: boolean }
   *               feeCategories:
   *                 type: array
   *                 items:
   *                   type: object
   *                   required: [feeCategoryId, amount]
   *                   properties:
   *                     feeCategoryId: { type: string, format: uuid }
   *                     amount: { type: number }
   *     responses:
   *       200:
   *         description: Fee structure updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/FeeStructure'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('fees.manage'), controller.update);

  /**
   * @openapi
   * /fee-structures/{id}:
   *   delete:
   *     tags: [Fees]
   *     summary: Delete a fee structure
   *     description: Delete a fee structure. Cannot delete structures used in generated invoices.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Fee structure ID
   *     responses:
   *       204:
   *         description: Fee structure deleted successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Cannot delete structure with associated invoices
   */
  router.delete('/:id', requirePermission('fees.manage'), controller.remove);

  return router;
}
