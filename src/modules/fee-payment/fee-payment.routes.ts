import { Router } from 'express';
import type { FeePaymentController } from './fee-payment.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createFeePaymentRoutes(controller: FeePaymentController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /fee-payments:
   *   get:
   *     tags: [Fees]
   *     summary: List fee payments
   *     description: Get a paginated list of fee payments with filtering options.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [createdAt, paidAt, amount]
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
   *         name: invoiceId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by invoice ID
   *       - in: query
   *         name: studentId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by student ID (via invoice)
   *       - in: query
   *         name: paymentMethod
   *         schema:
   *           type: string
   *           enum: [cash, bank_transfer, credit_card, mobile_money, cheque]
   *         description: Filter by payment method
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter payments from this date
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter payments until this date
   *     responses:
   *       200:
   *         description: Payments retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/FeePayment'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('fee-payments.list'), controller.list);

  /**
   * @openapi
   * /fee-payments/{id}:
   *   get:
   *     tags: [Fees]
   *     summary: Get a fee payment by ID
   *     description: Retrieve detailed information about a specific fee payment including receipt details.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Payment ID
   *     responses:
   *       200:
   *         description: Payment details retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/FeePayment'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('fee-payments.read'), controller.getById);

  /**
   * @openapi
   * /fee-payments:
   *   post:
   *     tags: [Fees]
   *     summary: Record a fee payment
   *     description: |
   *       Record a payment against a fee invoice.
   *       The invoice status will be automatically updated based on the payment amount.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [invoiceId, amount, paymentMethod, paidAt]
   *             properties:
   *               invoiceId:
   *                 type: string
   *                 format: uuid
   *                 description: Invoice ID to apply payment to
   *               amount:
   *                 type: number
   *                 minimum: 0.01
   *                 description: Payment amount
   *                 example: 500.00
   *               paymentMethod:
   *                 type: string
   *                 enum: [cash, bank_transfer, credit_card, mobile_money, cheque]
   *                 description: Payment method
   *               paidAt:
   *                 type: string
   *                 format: date-time
   *                 description: When the payment was received
   *               transactionRef:
   *                 type: string
   *                 maxLength: 100
   *                 description: Transaction reference number (e.g., bank reference, check number)
   *               notes:
   *                 type: string
   *                 maxLength: 500
   *                 description: Additional notes about the payment
   *     responses:
   *       201:
   *         description: Payment recorded successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/FeePayment'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Invoice not found
   *       409:
   *         description: Invoice is cancelled or payment amount exceeds balance
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('fee-payments.create'), controller.create);

  return router;
}
