import { Router } from 'express';
import type { LessonController } from './lesson.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createLessonRoutes(controller: LessonController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /lessons:
   *   get:
   *     tags: [Timetable]
   *     summary: List lessons
   *     description: Get a paginated list of lessons with filtering options.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - in: query
   *         name: classSectionId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by class section
   *       - in: query
   *         name: teacherId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by teacher
   *       - in: query
   *         name: subjectId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by subject
   *       - in: query
   *         name: dayOfWeek
   *         schema:
   *           type: integer
   *           minimum: 0
   *           maximum: 6
   *         description: Filter by day of week (0=Sunday, 6=Saturday)
   *     responses:
   *       200:
   *         description: Lessons retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Lesson'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('lessons.list'), controller.list);

  /**
   * @openapi
   * /lessons/{id}:
   *   get:
   *     tags: [Timetable]
   *     summary: Get a lesson by ID
   *     description: Retrieve detailed information about a specific lesson.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Lesson ID
   *     responses:
   *       200:
   *         description: Lesson details retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Lesson'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('lessons.read'), controller.getById);

  /**
   * @openapi
   * /lessons:
   *   post:
   *     tags: [Timetable]
   *     summary: Create a lesson
   *     description: Create a single lesson/period in the timetable.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [classSectionId, subjectId, teacherId, timeSlotId, dayOfWeek, effectiveFrom]
   *             properties:
   *               classSectionId: { type: string, format: uuid }
   *               subjectId: { type: string, format: uuid }
   *               teacherId: { type: string, format: uuid }
   *               timeSlotId: { type: string, format: uuid }
   *               roomId: { type: string, format: uuid, nullable: true }
   *               dayOfWeek: { type: integer, minimum: 0, maximum: 6 }
   *               effectiveFrom: { type: string, format: date }
   *               effectiveUntil: { type: string, format: date, nullable: true }
   *     responses:
   *       201:
   *         description: Lesson created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Lesson'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       409:
   *         description: Teacher or room conflict detected
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('lessons.create'), controller.create);

  /**
   * @openapi
   * /lessons/bulk-create:
   *   post:
   *     tags: [Timetable]
   *     summary: Bulk create lessons
   *     description: Create multiple lessons at once for efficient timetable setup.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [lessons]
   *             properties:
   *               lessons:
   *                 type: array
   *                 items:
   *                   type: object
   *                   required: [classSectionId, subjectId, teacherId, timeSlotId, dayOfWeek, effectiveFrom]
   *                   properties:
   *                     classSectionId: { type: string, format: uuid }
   *                     subjectId: { type: string, format: uuid }
   *                     teacherId: { type: string, format: uuid }
   *                     timeSlotId: { type: string, format: uuid }
   *                     roomId: { type: string, format: uuid, nullable: true }
   *                     dayOfWeek: { type: integer }
   *                     effectiveFrom: { type: string, format: date }
   *     responses:
   *       201:
   *         description: Lessons created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: object
   *                   properties:
   *                     createdCount: { type: integer }
   *                     conflicts: { type: array, items: { type: object } }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.post('/bulk-create', requirePermission('lessons.create'), controller.bulkCreate);

  /**
   * @openapi
   * /lessons/auto-generate:
   *   post:
   *     tags: [Timetable]
   *     summary: Auto-generate timetable
   *     description: |
   *       Automatically generate a complete timetable using constraint-based scheduling.
   *       Attempts to balance teacher workload and avoid conflicts.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [periodSetId, effectiveFrom]
   *             properties:
   *               periodSetId: { type: string, format: uuid }
   *               effectiveFrom: { type: string, format: date }
   *               preferences:
   *                 type: object
   *                 properties:
   *                   balanceTeacherLoad: { type: boolean, default: true }
   *                   preferMorningForCore: { type: boolean, default: true }
   *     responses:
   *       201:
   *         description: Timetable generated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: object
   *                   properties:
   *                     generatedCount: { type: integer }
   *                     warnings: { type: array, items: { type: string } }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.post('/auto-generate', requirePermission('lessons.generate'), controller.autoGenerate);

  /**
   * @openapi
   * /lessons/clear:
   *   delete:
   *     tags: [Timetable]
   *     summary: Clear timetable
   *     description: Delete all lessons for a specific period set or date range.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               periodSetId: { type: string, format: uuid }
   *               startDate: { type: string, format: date }
   *               endDate: { type: string, format: date }
   *     responses:
   *       200:
   *         description: Lessons cleared successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.delete('/clear', requirePermission('lessons.delete'), controller.clear);

  /**
   * @openapi
   * /lessons/{id}:
   *   patch:
   *     tags: [Timetable]
   *     summary: Update a lesson
   *     description: Update lesson details such as teacher, room, or time slot.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               teacherId: { type: string, format: uuid }
   *               roomId: { type: string, format: uuid, nullable: true }
   *               timeSlotId: { type: string, format: uuid }
   *     responses:
   *       200:
   *         description: Lesson updated successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Conflict with another lesson
   */
  router.patch('/:id', requirePermission('lessons.update'), controller.update);

  /**
   * @openapi
   * /lessons/{id}/cancel:
   *   post:
   *     tags: [Timetable]
   *     summary: Cancel a lesson
   *     description: Mark a lesson as cancelled for a specific date.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [date]
   *             properties:
   *               date: { type: string, format: date }
   *               reason: { type: string, maxLength: 500 }
   *     responses:
   *       200:
   *         description: Lesson cancelled successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.post('/:id/cancel', requirePermission('lessons.cancel'), controller.cancel);

  return router;
}

export function createTimetableRoutes(controller: LessonController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /timetable/class/{classSectionId}:
   *   get:
   *     tags: [Timetable]
   *     summary: Get timetable for a class
   *     description: Retrieve the complete weekly timetable for a specific class section.
   *     parameters:
   *       - in: path
   *         name: classSectionId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: date
   *         schema:
   *           type: string
   *           format: date
   *         description: Get timetable effective on this date
   *     responses:
   *       200:
   *         description: Timetable retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Lesson'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Class section not found
   */
  router.get('/class/:classSectionId', requirePermission('lessons.list'), controller.timetableByClass);

  /**
   * @openapi
   * /timetable/teacher/{teacherId}:
   *   get:
   *     tags: [Timetable]
   *     summary: Get timetable for a teacher
   *     description: Retrieve the complete weekly teaching schedule for a specific teacher.
   *     parameters:
   *       - in: path
   *         name: teacherId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: date
   *         schema:
   *           type: string
   *           format: date
   *         description: Get timetable effective on this date
   *     responses:
   *       200:
   *         description: Timetable retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Lesson'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Teacher not found
   */
  router.get('/teacher/:teacherId', requirePermission('lessons.list'), controller.timetableByTeacher);

  /**
   * @openapi
   * /timetable/room/{roomId}:
   *   get:
   *     tags: [Timetable]
   *     summary: Get timetable for a room
   *     description: Retrieve the complete weekly usage schedule for a specific room.
   *     parameters:
   *       - in: path
   *         name: roomId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: date
   *         schema:
   *           type: string
   *           format: date
   *         description: Get timetable effective on this date
   *     responses:
   *       200:
   *         description: Timetable retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Lesson'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Room not found
   */
  router.get('/room/:roomId', requirePermission('lessons.list'), controller.timetableByRoom);

  return router;
}
