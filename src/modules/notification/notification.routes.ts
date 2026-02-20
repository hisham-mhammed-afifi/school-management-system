import { Router } from 'express';
import type { NotificationController } from './notification.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createNotificationRoutes(controller: NotificationController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /notifications:
   *   get:
   *     tags: [Notifications]
   *     summary: List user notifications
   *     description: |
   *       Get a paginated list of notifications for the current user.
   *       Can be filtered by read status or notification type.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - in: query
   *         name: isRead
   *         schema:
   *           type: boolean
   *         description: Filter by read status
   *     responses:
   *       200:
   *         description: Notifications retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Notification'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   */
  router.get('/', controller.list);

  /**
   * @openapi
   * /notifications/unread-count:
   *   get:
   *     tags: [Notifications]
   *     summary: Get unread notification count
   *     description: Get the count of unread notifications for the current user.
   *     responses:
   *       200:
   *         description: Unread count retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: object
   *                   properties:
   *                     unreadCount: { type: integer, example: 5 }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   */
  router.get('/unread-count', controller.unreadCount);

  /**
   * @openapi
   * /notifications/{id}/read:
   *   post:
   *     tags: [Notifications]
   *     summary: Mark notification as read
   *     description: Mark a specific notification as read for the current user.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Notification ID
   *     responses:
   *       200:
   *         description: Notification marked as read
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/Notification'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.post('/:id/read', controller.markRead);

  /**
   * @openapi
   * /notifications/read-all:
   *   post:
   *     tags: [Notifications]
   *     summary: Mark all notifications as read
   *     description: Mark all unread notifications as read for the current user.
   *     responses:
   *       200:
   *         description: All notifications marked as read
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: object
   *                   properties:
   *                     markedCount: { type: integer, example: 15 }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   */
  router.post('/read-all', controller.markAllRead);

  /**
   * @openapi
   * /notifications/send:
   *   post:
   *     tags: [Notifications]
   *     summary: Send notifications to users
   *     description: |
   *       Send custom notifications to specific users or groups.
   *       Requires admin/notification send permissions.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [title, message, recipients]
   *             properties:
   *               title:
   *                 type: string
   *                 example: 'Important Update'
   *               message:
   *                 type: string
   *                 example: 'Please check your email for important information'
   *               type:
   *                 type: string
   *                 default: 'custom'
   *               recipients:
   *                 type: array
   *                 description: Array of user IDs to receive notification
   *                 items:
   *                   type: string
   *                   format: uuid
   *     responses:
   *       201:
   *         description: Notifications sent successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: object
   *                   properties:
   *                     sentCount: { type: integer, example: 42 }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/send', requirePermission('notifications.create'), controller.send);

  return router;
}
