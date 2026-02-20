import { Router } from 'express';
import type { AuditLogController } from './audit-log.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createAuditLogRoutes(controller: AuditLogController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /audit-logs:
   *   get:
   *     tags: [Audit Logs]
   *     summary: List audit logs
   *     description: |
   *       Get a paginated list of audit logs for security and compliance tracking.
   *       Logs all user actions including creates, updates, and deletes.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - in: query
   *         name: userId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by user who performed the action
   *       - in: query
   *         name: action
   *         schema:
   *           type: string
   *           enum: [CREATE, UPDATE, DELETE, LOGIN, LOGOUT]
   *         description: Filter by action type
   *       - in: query
   *         name: entityType
   *         schema:
   *           type: string
   *         description: Filter by entity type (Student, Teacher, etc)
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter logs from this date
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter logs until this date
   *     responses:
   *       200:
   *         description: Audit logs retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/AuditLog'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('audit-logs.list'), controller.list);

  /**
   * @openapi
   * /audit-logs/{id}:
   *   get:
   *     tags: [Audit Logs]
   *     summary: Get an audit log by ID
   *     description: Retrieve detailed information about a specific audit log entry.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Audit log ID
   *     responses:
   *       200:
   *         description: Audit log retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/AuditLog'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('audit-logs.read'), controller.getById);

  return router;
}
