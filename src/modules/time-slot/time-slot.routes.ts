import { Router } from 'express';
import type { TimeSlotController } from './time-slot.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createTimeSlotRoutes(controller: TimeSlotController): Router {
  const router = Router({ mergeParams: true });

  router.use(authenticate);

  /**
   * @openapi
   * /periods/{periodId}/time-slots:
   *   get:
   *     tags: [Timetable]
   *     summary: List time slots for a period
   *     description: |
   *       Get all time slots configured for a specific period.
   *       Time slots define the start and end times for a period.
   *     parameters:
   *       - in: path
   *         name: periodId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Period ID
   *     responses:
   *       200:
   *         description: Time slots retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/TimeSlot'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Period not found
   */
  router.get('/', requirePermission('time-slots.list'), controller.list);

  /**
   * @openapi
   * /periods/{periodId}/time-slots/generate:
   *   post:
   *     tags: [Timetable]
   *     summary: Generate time slots for a period
   *     description: |
   *       Auto-generate time slots for a period based on specified start time and duration.
   *       This creates consistent time slots across all periods in the schedule.
   *     parameters:
   *       - in: path
   *         name: periodId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Period ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [startTime, durationMinutes]
   *             properties:
   *               startTime:
   *                 type: string
   *                 format: time
   *                 example: '08:00:00'
   *                 description: Start time for the period
   *               durationMinutes:
   *                 type: integer
   *                 example: 45
   *                 description: Duration of the period in minutes
   *     responses:
   *       201:
   *         description: Time slots generated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/TimeSlot'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Period not found
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/generate', requirePermission('time-slots.create'), controller.generate);

  return router;
}
