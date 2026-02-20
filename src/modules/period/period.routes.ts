import { Router } from 'express';
import type { PeriodController } from './period.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createPeriodRoutes(controller: PeriodController): Router {
  const router = Router({ mergeParams: true });

  router.use(authenticate);

  /**
   * @openapi
   * /working-days/{workingDayId}/periods:
   *   get:
   *     tags: [Timetable]
   *     summary: List periods for a working day
   *     description: |
   *       Get all periods configured for a specific working day.
   *       Periods represent the class periods (e.g., Period 1, Period 2) in a day.
   *     parameters:
   *       - in: path
   *         name: workingDayId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Working day ID
   *     responses:
   *       200:
   *         description: Periods retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Period'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Working day not found
   */
  router.get('/', requirePermission('periods.list'), controller.list);

  /**
   * @openapi
   * /working-days/{workingDayId}/periods:
   *   put:
   *     tags: [Timetable]
   *     summary: Replace all periods for a working day
   *     description: |
   *       Replace the entire periods configuration for a working day.
   *       This bulk operation removes existing periods and creates new ones.
   *     parameters:
   *       - in: path
   *         name: workingDayId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Working day ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [periods]
   *             properties:
   *               periods:
   *                 type: array
   *                 description: Array of period configurations
   *                 items:
   *                   type: object
   *                   required: [periodNumber, name]
   *                   properties:
   *                     periodNumber:
   *                       type: integer
   *                       example: 1
   *                       description: Sequence number of the period
   *                     name:
   *                       type: string
   *                       example: 'Period 1'
   *     responses:
   *       200:
   *         description: Periods replaced successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Period'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Working day not found
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.put('/', requirePermission('periods.update'), controller.replace);

  return router;
}
