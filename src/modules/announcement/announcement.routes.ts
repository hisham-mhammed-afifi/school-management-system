import { Router } from 'express';
import type { AnnouncementController } from './announcement.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createAnnouncementRoutes(controller: AnnouncementController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /announcements:
   *   get:
   *     tags: [Announcements]
   *     summary: List announcements
   *     description: |
   *       Get a paginated list of announcements for the current school.
   *       Can be filtered by target audience, priority, or published status.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - in: query
   *         name: targetAudience
   *         schema:
   *           type: string
   *           enum: [all, students, teachers, parents, staff]
   *         description: Filter by target audience
   *       - in: query
   *         name: priority
   *         schema:
   *           type: string
   *           enum: [low, normal, high, urgent]
   *         description: Filter by priority
   *       - in: query
   *         name: published
   *         schema:
   *           type: boolean
   *         description: Filter by published status
   *     responses:
   *       200:
   *         description: Announcements retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Announcement'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('announcements.view'), controller.list);

  /**
   * @openapi
   * /announcements/{id}:
   *   get:
   *     tags: [Announcements]
   *     summary: Get an announcement by ID
   *     description: Retrieve detailed information about a specific announcement.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Announcement ID
   *     responses:
   *       200:
   *         description: Announcement retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Announcement'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('announcements.view'), controller.getById);

  /**
   * @openapi
   * /announcements:
   *   post:
   *     tags: [Announcements]
   *     summary: Create a new announcement
   *     description: |
   *       Create a new announcement for the school.
   *       Announcements can target specific audiences and have priority levels.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [title, content, targetAudience]
   *             properties:
   *               title:
   *                 type: string
   *                 example: 'School Closure Notice'
   *               content:
   *                 type: string
   *                 example: 'School will be closed on Friday due to maintenance'
   *               priority:
   *                 type: string
   *                 enum: [low, normal, high, urgent]
   *                 default: normal
   *               targetAudience:
   *                 type: string
   *                 enum: [all, students, teachers, parents, staff]
   *                 example: 'all'
   *               expiresAt:
   *                 type: string
   *                 format: date-time
   *                 description: Expiration date for the announcement
   *     responses:
   *       201:
   *         description: Announcement created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Announcement'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('announcements.create'), controller.create);

  /**
   * @openapi
   * /announcements/{id}:
   *   patch:
   *     tags: [Announcements]
   *     summary: Update an announcement
   *     description: Update announcement details such as title, content, or priority.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Announcement ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title: { type: string }
   *               content: { type: string }
   *               priority: { type: string, enum: [low, normal, high, urgent] }
   *               targetAudience: { type: string, enum: [all, students, teachers, parents, staff] }
   *               expiresAt: { type: string, format: date-time }
   *     responses:
   *       200:
   *         description: Announcement updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Announcement'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.patch('/:id', requirePermission('announcements.update'), controller.update);

  /**
   * @openapi
   * /announcements/{id}/publish:
   *   post:
   *     tags: [Announcements]
   *     summary: Publish an announcement
   *     description: |
   *       Publish an announcement to make it visible to the target audience.
   *       Sends notifications to relevant users.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Announcement ID
   *     responses:
   *       200:
   *         description: Announcement published successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Announcement'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Announcement already published
   */
  router.post('/:id/publish', requirePermission('announcements.publish'), controller.publish);

  /**
   * @openapi
   * /announcements/{id}:
   *   delete:
   *     tags: [Announcements]
   *     summary: Delete an announcement
   *     description: Delete an announcement. Published announcements should be expired rather than deleted.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Announcement ID
   *     responses:
   *       204:
   *         description: Announcement deleted successfully
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.delete('/:id', requirePermission('announcements.delete'), controller.remove);

  return router;
}
