import { Router } from 'express';
import type { AcademicEventController } from './academic-event.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createAcademicEventRoutes(controller: AcademicEventController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /academic-events:
   *   get:
   *     tags: [Academic Events]
   *     summary: List academic events
   *     description: |
   *       Get a paginated list of academic calendar events for the current school.
   *       Includes holidays, exams, meetings, and other school events.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - in: query
   *         name: eventType
   *         schema:
   *           type: string
   *           enum: [holiday, exam, meeting, event, other]
   *         description: Filter by event type
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter events starting from this date
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter events ending before this date
   *     responses:
   *       200:
   *         description: Academic events retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/AcademicEvent'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('events.view'), controller.list);

  /**
   * @openapi
   * /academic-events/{id}:
   *   get:
   *     tags: [Academic Events]
   *     summary: Get an academic event by ID
   *     description: Retrieve detailed information about a specific academic event.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Academic event ID
   *     responses:
   *       200:
   *         description: Academic event retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/AcademicEvent'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('events.view'), controller.getById);

  /**
   * @openapi
   * /academic-events:
   *   post:
   *     tags: [Academic Events]
   *     summary: Create a new academic event
   *     description: |
   *       Add a new event to the school calendar.
   *       Events can be holidays, exams, meetings, or other school activities.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [title, eventType, startDate]
   *             properties:
   *               title:
   *                 type: string
   *                 example: 'Parent-Teacher Meeting'
   *               description:
   *                 type: string
   *                 example: 'Quarterly parent-teacher conference to discuss student progress'
   *               eventType:
   *                 type: string
   *                 enum: [holiday, exam, meeting, event, other]
   *                 example: 'meeting'
   *               startDate:
   *                 type: string
   *                 format: date
   *                 description: Event start date
   *               endDate:
   *                 type: string
   *                 format: date
   *                 nullable: true
   *                 description: Event end date (null for single-day events)
   *               location:
   *                 type: string
   *                 example: 'School Auditorium'
   *               allDay:
   *                 type: boolean
   *                 default: true
   *                 description: Whether the event lasts all day
   *     responses:
   *       201:
   *         description: Academic event created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/AcademicEvent'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('events.create'), controller.create);

  /**
   * @openapi
   * /academic-events/{id}:
   *   patch:
   *     tags: [Academic Events]
   *     summary: Update an academic event
   *     description: Update academic event details such as title, dates, or location.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Academic event ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title: { type: string }
   *               description: { type: string }
   *               eventType: { type: string, enum: [holiday, exam, meeting, event, other] }
   *               startDate: { type: string, format: date }
   *               endDate: { type: string, format: date, nullable: true }
   *               location: { type: string }
   *               allDay: { type: boolean }
   *     responses:
   *       200:
   *         description: Academic event updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/AcademicEvent'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('events.update'), controller.update);

  /**
   * @openapi
   * /academic-events/{id}:
   *   delete:
   *     tags: [Academic Events]
   *     summary: Delete an academic event
   *     description: Delete an academic event from the school calendar.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Academic event ID
   *     responses:
   *       204:
   *         description: Academic event deleted successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.delete('/:id', requirePermission('events.delete'), controller.remove);

  return router;
}
