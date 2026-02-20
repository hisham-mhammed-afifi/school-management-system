import { Router } from 'express';
import type { FinancialReportController } from './financial-report.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createFinancialReportRoutes(controller: FinancialReportController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /financial-reports/outstanding:
   *   get:
   *     tags: [Fees]
   *     summary: Get outstanding fees report
   *     description: |
   *       Generate a report of all outstanding (unpaid) fees.
   *       Shows total outstanding amounts, invoices, and balances.
   *     parameters:
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date for the report period
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: End date for the report period
   *       - in: query
   *         name: gradeId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by grade
   *     responses:
   *       200:
   *         description: Outstanding fees report generated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/FinancialReport'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.get('/outstanding', requirePermission('financial-reports.read'), controller.outstanding);

  /**
   * @openapi
   * /financial-reports/collection:
   *   get:
   *     tags: [Fees]
   *     summary: Get fee collection report
   *     description: |
   *       Generate a report of fees collected during a specific period.
   *       Includes total payments, payment methods breakdown, and trends.
   *     parameters:
   *       - in: query
   *         name: startDate
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date for the report period
   *       - in: query
   *         name: endDate
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *         description: End date for the report period
   *       - in: query
   *         name: paymentMethod
   *         schema:
   *           type: string
   *           enum: [cash, bank_transfer, credit_card, mobile_money, cheque]
   *         description: Filter by payment method
   *     responses:
   *       200:
   *         description: Fee collection report generated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/FinancialReport'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.get('/collection', requirePermission('financial-reports.read'), controller.collection);

  /**
   * @openapi
   * /financial-reports/student-balance:
   *   get:
   *     tags: [Fees]
   *     summary: Get student balance report
   *     description: |
   *       Generate a report showing fee balances for all students.
   *       Useful for identifying students with outstanding payments.
   *     parameters:
   *       - in: query
   *         name: gradeId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by grade
   *       - in: query
   *         name: classSectionId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by class section
   *       - in: query
   *         name: balanceType
   *         schema:
   *           type: string
   *           enum: [all, outstanding, paid, credit]
   *         description: Filter by balance type
   *     responses:
   *       200:
   *         description: Student balance report generated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       studentId: { type: string, format: uuid }
   *                       studentName: { type: string, example: 'John Doe' }
   *                       grade: { type: string, example: 'Grade 10' }
   *                       totalInvoiced: { type: number, example: 5000.00 }
   *                       totalPaid: { type: number, example: 3000.00 }
   *                       balance: { type: number, example: 2000.00 }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.get('/student-balance', requirePermission('financial-reports.read'), controller.studentBalance);

  /**
   * @openapi
   * /financial-reports/category-breakdown:
   *   get:
   *     tags: [Fees]
   *     summary: Get fee category breakdown report
   *     description: |
   *       Generate a breakdown of fees by category (tuition, lab, transport, etc).
   *       Shows invoiced amounts and collection rates per category.
   *     parameters:
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date for the report period
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: End date for the report period
   *       - in: query
   *         name: academicYearId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by academic year
   *     responses:
   *       200:
   *         description: Fee category breakdown report generated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       categoryId: { type: string, format: uuid }
   *                       categoryName: { type: string, example: 'Tuition Fee' }
   *                       totalInvoiced: { type: number, example: 250000.00 }
   *                       totalCollected: { type: number, example: 180000.00 }
   *                       collectionRate: { type: number, example: 72.0, description: 'Percentage collected' }
   *                       outstanding: { type: number, example: 70000.00 }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.get('/category-breakdown', requirePermission('financial-reports.read'), controller.categoryBreakdown);

  return router;
}
