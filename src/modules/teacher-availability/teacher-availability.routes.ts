import { Router } from 'express';
import type { TeacherAvailabilityController } from './teacher-availability.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createTeacherAvailabilityRoutes(controller: TeacherAvailabilityController): Router {
  const router = Router({ mergeParams: true });

  router.use(authenticate);

  /**
   * @openapi
   * /teachers/{teacherId}/availability:
   *   get:
   *     tags: [Teachers]
   *     summary: Get teacher availability
   *     description: |
   *       Retrieve the weekly availability schedule for a specific teacher.
   *       Shows which days and time slots the teacher is available for scheduling.
   *     parameters:
   *       - in: path
   *         name: teacherId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Teacher ID
   *     responses:
   *       200:
   *         description: Teacher availability retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/TeacherAvailability'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Teacher not found
   */
  router.get('/', requirePermission('availability.view'), controller.get);

  /**
   * @openapi
   * /teachers/{teacherId}/availability:
   *   put:
   *     tags: [Teachers]
   *     summary: Replace teacher availability
   *     description: |
   *       Replace the entire weekly availability schedule for a teacher.
   *       This bulk operation removes existing availability records and creates new ones.
   *     parameters:
   *       - in: path
   *         name: teacherId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Teacher ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [availability]
   *             properties:
   *               availability:
   *                 type: array
   *                 description: Array of availability slots
   *                 items:
   *                   type: object
   *                   required: [dayOfWeek, isAvailable]
   *                   properties:
   *                     dayOfWeek:
   *                       type: integer
   *                       minimum: 0
   *                       maximum: 6
   *                       description: Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
   *                     timeSlotId:
   *                       type: string
   *                       format: uuid
   *                       nullable: true
   *                       description: Specific time slot (null means entire day)
   *                     isAvailable:
   *                       type: boolean
   *                       example: true
   *                     reason:
   *                       type: string
   *                       nullable: true
   *                       description: Reason for unavailability
   *     responses:
   *       200:
   *         description: Teacher availability updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/TeacherAvailability'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Teacher or time slot not found
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.put('/', requirePermission('availability.manage'), controller.replace);

  return router;
}
