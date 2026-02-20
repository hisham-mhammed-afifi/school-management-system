import { Router } from 'express';
import type { FeeCategoryController } from './fee-category.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createFeeCategoryRoutes(controller: FeeCategoryController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /fee-categories:
   *   get:
   *     tags: [Fees]
   *     summary: List fee categories
   *     description: |
   *       Get a list of fee categories for the current school.
   *       Fee categories define types of fees (tuition, lab, transport, etc).
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - in: query
   *         name: isActive
   *         schema:
   *           type: boolean
   *         description: Filter by active status
   *     responses:
   *       200:
   *         description: Fee categories retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/FeeCategory'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('fee-categories.list'), controller.list);

  /**
   * @openapi
   * /fee-categories:
   *   post:
   *     tags: [Fees]
   *     summary: Create a new fee category
   *     description: Create a new fee category with a default amount.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, amount]
   *             properties:
   *               name:
   *                 type: string
   *                 example: 'Tuition Fee'
   *               description:
   *                 type: string
   *                 example: 'Annual tuition fee'
   *               amount:
   *                 type: number
   *                 example: 5000.00
   *                 description: Default amount for this category
   *               isActive:
   *                 type: boolean
   *                 default: true
   *     responses:
   *       201:
   *         description: Fee category created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/FeeCategory'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       409:
   *         description: Fee category with this name already exists
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('fee-categories.create'), controller.create);

  /**
   * @openapi
   * /fee-categories/{id}:
   *   patch:
   *     tags: [Fees]
   *     summary: Update a fee category
   *     description: Update fee category details such as name, amount, or active status.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Fee category ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string }
   *               description: { type: string }
   *               amount: { type: number }
   *               isActive: { type: boolean }
   *     responses:
   *       200:
   *         description: Fee category updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/FeeCategory'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('fee-categories.update'), controller.update);

  /**
   * @openapi
   * /fee-categories/{id}:
   *   delete:
   *     tags: [Fees]
   *     summary: Delete a fee category
   *     description: Delete a fee category. Cannot delete categories used in fee structures or invoices.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Fee category ID
   *     responses:
   *       204:
   *         description: Fee category deleted successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Cannot delete category with associated data
   */
  router.delete('/:id', requirePermission('fee-categories.delete'), controller.remove);

  return router;
}
