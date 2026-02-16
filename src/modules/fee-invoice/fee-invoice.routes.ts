import { Router } from 'express';
import type { FeeInvoiceController } from './fee-invoice.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createFeeInvoiceRoutes(controller: FeeInvoiceController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /fee-invoices:
   *   get:
   *     tags: [Fees]
   *     summary: List fee invoices
   *     description: Get a paginated list of fee invoices with filtering options.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [createdAt, dueDate, netAmount]
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
   *         name: studentId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by student ID
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [draft, issued, partially_paid, paid, overdue, cancelled]
   *         description: Filter by invoice status
   *     responses:
   *       200:
   *         description: Invoices retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/FeeInvoice'
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
   * /fee-invoices/{id}:
   *   get:
   *     tags: [Fees]
   *     summary: Get a fee invoice by ID
   *     description: Retrieve detailed information about a specific fee invoice including line items and payment history.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Invoice ID
   *     responses:
   *       200:
   *         description: Invoice details retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/FeeInvoice'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('fees.view'), controller.getById);

  /**
   * @openapi
   * /fee-invoices:
   *   post:
   *     tags: [Fees]
   *     summary: Create a fee invoice
   *     description: Create a new fee invoice for a student with one or more line items.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [studentId, dueDate, items]
   *             properties:
   *               studentId:
   *                 type: string
   *                 format: uuid
   *                 description: Student ID
   *               dueDate:
   *                 type: string
   *                 format: date
   *                 description: Invoice due date
   *               items:
   *                 type: array
   *                 minItems: 1
   *                 items:
   *                   type: object
   *                   required: [feeStructureId, unitAmount]
   *                   properties:
   *                     feeStructureId: { type: string, format: uuid }
   *                     description: { type: string, maxLength: 255 }
   *                     quantity: { type: integer, minimum: 1, default: 1 }
   *                     unitAmount: { type: number, minimum: 0 }
   *     responses:
   *       201:
   *         description: Invoice created successfully with draft status
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/FeeInvoice'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Student or fee structure not found
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('fees.create_invoice'), controller.create);

  /**
   * @openapi
   * /fee-invoices/bulk-generate:
   *   post:
   *     tags: [Fees]
   *     summary: Bulk generate invoices
   *     description: |
   *       Generate fee invoices for all students in a specific grade/academic year.
   *       Useful for semester/annual fee generation.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [academicYearId, gradeId, dueDate, feeStructureIds]
   *             properties:
   *               academicYearId:
   *                 type: string
   *                 format: uuid
   *                 description: Academic year ID
   *               gradeId:
   *                 type: string
   *                 format: uuid
   *                 description: Grade ID (all students in this grade will receive invoices)
   *               dueDate:
   *                 type: string
   *                 format: date
   *                 description: Due date for all generated invoices
   *               feeStructureIds:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: uuid
   *                 minItems: 1
   *                 description: Fee structures to include in each invoice
   *     responses:
   *       201:
   *         description: Invoices generated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: object
   *                   properties:
   *                     generatedCount: { type: integer, example: 45 }
   *                     totalAmount: { type: number, example: 45000.00 }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Academic year, grade, or fee structure not found
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/bulk-generate', requirePermission('fees.create_invoice'), controller.bulkGenerate);

  /**
   * @openapi
   * /fee-invoices/{id}/issue:
   *   post:
   *     tags: [Fees]
   *     summary: Issue an invoice
   *     description: |
   *       Change invoice status from 'draft' to 'issued'.
   *       Once issued, the invoice becomes visible to guardians and cannot be edited.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Invoice ID
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               notifyGuardian:
   *                 type: boolean
   *                 default: false
   *                 description: Send notification to guardian
   *     responses:
   *       200:
   *         description: Invoice issued successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/FeeInvoice'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Invoice is not in draft status
   */
  router.post('/:id/issue', requirePermission('fees.issue_invoice'), controller.issue);

  /**
   * @openapi
   * /fee-invoices/{id}/cancel:
   *   post:
   *     tags: [Fees]
   *     summary: Cancel an invoice
   *     description: |
   *       Cancel a fee invoice. Cancelled invoices cannot be paid.
   *       If the invoice has partial payments, they will be refunded or applied to future invoices.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Invoice ID
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               reason:
   *                 type: string
   *                 maxLength: 500
   *                 description: Reason for cancellation
   *     responses:
   *       200:
   *         description: Invoice cancelled successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/FeeInvoice'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Invoice is already fully paid or cancelled
   */
  router.post('/:id/cancel', requirePermission('fees.cancel_invoice'), controller.cancel);

  return router;
}
