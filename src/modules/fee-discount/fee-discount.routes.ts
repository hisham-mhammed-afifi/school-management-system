import { Router } from 'express';
import type { FeeDiscountController } from './fee-discount.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createFeeDiscountRoutes(controller: FeeDiscountController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /fee-discounts:
   *   get:
   *     tags: [Fees]
   *     summary: List fee discounts
   *     description: |
   *       Get a list of fee discounts for the current school.
   *       Discounts can be percentage-based or fixed amounts.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - in: query
   *         name: isActive
   *         schema:
   *           type: boolean
   *         description: Filter by active status
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [percentage, fixed_amount]
   *         description: Filter by discount type
   *     responses:
   *       200:
   *         description: Fee discounts retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/FeeDiscount'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('fee-discounts.list'), controller.list);

  /**
   * @openapi
   * /fee-discounts:
   *   post:
   *     tags: [Fees]
   *     summary: Create a new fee discount
   *     description: |
   *       Create a new discount policy for fee invoices.
   *       Can be percentage-based (e.g., 10% off) or fixed amount (e.g., $500 off).
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name, type, value]
   *             properties:
   *               name:
   *                 type: string
   *                 example: 'Sibling Discount'
   *               description:
   *                 type: string
   *                 example: '10% discount for families with multiple children'
   *               type:
   *                 type: string
   *                 enum: [percentage, fixed_amount]
   *                 example: 'percentage'
   *               value:
   *                 type: number
   *                 example: 10.00
   *                 description: For percentage, value is % (10 = 10%); for fixed_amount, value is amount
   *               validFrom:
   *                 type: string
   *                 format: date
   *                 description: Start date for discount validity
   *               validUntil:
   *                 type: string
   *                 format: date
   *                 description: End date for discount validity
   *               isActive:
   *                 type: boolean
   *                 default: true
   *     responses:
   *       201:
   *         description: Fee discount created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/FeeDiscount'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       409:
   *         description: Fee discount with this name already exists
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('fee-discounts.create'), controller.create);

  /**
   * @openapi
   * /fee-discounts/{id}:
   *   patch:
   *     tags: [Fees]
   *     summary: Update a fee discount
   *     description: Update fee discount details such as name, value, or validity dates.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Fee discount ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name: { type: string }
   *               description: { type: string }
   *               type: { type: string, enum: [percentage, fixed_amount] }
   *               value: { type: number }
   *               validFrom: { type: string, format: date }
   *               validUntil: { type: string, format: date }
   *               isActive: { type: boolean }
   *     responses:
   *       200:
   *         description: Fee discount updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/FeeDiscount'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('fee-discounts.update'), controller.update);

  /**
   * @openapi
   * /fee-discounts/{id}:
   *   delete:
   *     tags: [Fees]
   *     summary: Delete a fee discount
   *     description: Delete a fee discount. Cannot delete discounts applied to existing invoices.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Fee discount ID
   *     responses:
   *       204:
   *         description: Fee discount deleted successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Cannot delete discount applied to invoices
   */
  router.delete('/:id', requirePermission('fee-discounts.delete'), controller.remove);

  return router;
}
