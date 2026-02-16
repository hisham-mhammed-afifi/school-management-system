import { Router } from 'express';
import type { WorkingDayController } from './working-day.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createWorkingDayRoutes(controller: WorkingDayController): Router {
  const router = Router({ mergeParams: true });

  router.use(authenticate);

  /**
   * @openapi
   * /period-sets/{periodSetId}/working-days:
   *   get:
   *     tags: [Timetable]
   *     summary: List working days for a period set
   *     description: |
   *       Get all working days configured for a specific period set.
   *       Working days define which days of the week are active in the schedule.
   *     parameters:
   *       - in: path
   *         name: periodSetId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Period set ID
   *     responses:
   *       200:
   *         description: Working days retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/WorkingDay'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Period set not found
   */
  router.get('/', requirePermission('scheduling.view'), controller.list);

  /**
   * @openapi
   * /period-sets/{periodSetId}/working-days:
   *   put:
   *     tags: [Timetable]
   *     summary: Replace all working days for a period set
   *     description: |
   *       Replace the entire working days configuration for a period set.
   *       This bulk operation removes existing working days and creates new ones.
   *     parameters:
   *       - in: path
   *         name: periodSetId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Period set ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [workingDays]
   *             properties:
   *               workingDays:
   *                 type: array
   *                 description: Array of working day configurations
   *                 items:
   *                   type: object
   *                   required: [dayOfWeek]
   *                   properties:
   *                     dayOfWeek:
   *                       type: integer
   *                       minimum: 0
   *                       maximum: 6
   *                       description: Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
   *                     isActive:
   *                       type: boolean
   *                       default: true
   *     responses:
   *       200:
   *         description: Working days replaced successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/WorkingDay'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Period set not found
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.put('/', requirePermission('scheduling.manage'), controller.replace);

  return router;
}
