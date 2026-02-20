import { Router } from 'express';
import type { TeacherLeaveController } from './teacher-leave.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createTeacherLeaveRoutes(controller: TeacherLeaveController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /teacher-leaves:
   *   get:
   *     tags: [Teachers]
   *     summary: List teacher leave requests
   *     description: |
   *       Get a paginated list of teacher leave requests for the current school.
   *       Can be filtered by teacher, status, or date range.
   *     parameters:
   *       - $ref: '#/components/parameters/PageParam'
   *       - $ref: '#/components/parameters/LimitParam'
   *       - in: query
   *         name: teacherId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by teacher
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, approved, rejected, cancelled]
   *         description: Filter by status
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter leaves starting from this date
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Filter leaves ending before this date
   *     responses:
   *       200:
   *         description: Teacher leaves retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/TeacherLeave'
   *                 meta:
   *                   $ref: '#/components/schemas/PaginationMeta'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('teacher-leaves.list'), controller.list);

  /**
   * @openapi
   * /teacher-leaves/{id}:
   *   get:
   *     tags: [Teachers]
   *     summary: Get a teacher leave by ID
   *     description: Retrieve detailed information about a specific leave request.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Teacher leave ID
   *     responses:
   *       200:
   *         description: Teacher leave retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/TeacherLeave'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  router.get('/:id', requirePermission('teacher-leaves.read'), controller.getById);

  /**
   * @openapi
   * /teacher-leaves:
   *   post:
   *     tags: [Teachers]
   *     summary: Create a new leave request
   *     description: |
   *       Submit a new leave request for a teacher.
   *       Leave requests start in pending status and require approval.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [teacherId, leaveType, startDate, endDate]
   *             properties:
   *               teacherId:
   *                 type: string
   *                 format: uuid
   *                 description: Teacher requesting leave
   *               leaveType:
   *                 type: string
   *                 enum: [sick, personal, vacation, emergency, other]
   *                 example: 'sick'
   *               startDate:
   *                 type: string
   *                 format: date
   *                 description: Leave start date
   *               endDate:
   *                 type: string
   *                 format: date
   *                 description: Leave end date
   *               reason:
   *                 type: string
   *                 example: 'Medical appointment'
   *                 description: Reason for leave
   *     responses:
   *       201:
   *         description: Leave request created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/TeacherLeave'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: Teacher not found
   *       409:
   *         description: Overlapping leave request exists
   *       422:
   *         $ref: '#/components/responses/ValidationError'
   */
  router.post('/', requirePermission('teacher-leaves.create'), controller.create);

  /**
   * @openapi
   * /teacher-leaves/{id}/approve:
   *   post:
   *     tags: [Teachers]
   *     summary: Approve a leave request
   *     description: |
   *       Approve a pending leave request.
   *       Updates status to approved and records approver details.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Teacher leave ID
   *     responses:
   *       200:
   *         description: Leave request approved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/TeacherLeave'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Leave request is not in pending status
   */
  router.post('/:id/approve', requirePermission('teacher-leaves.approve'), controller.approve);

  /**
   * @openapi
   * /teacher-leaves/{id}/reject:
   *   post:
   *     tags: [Teachers]
   *     summary: Reject a leave request
   *     description: |
   *       Reject a pending leave request.
   *       Updates status to rejected and records approver details.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Teacher leave ID
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               reason:
   *                 type: string
   *                 description: Reason for rejection
   *     responses:
   *       200:
   *         description: Leave request rejected successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/TeacherLeave'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Leave request is not in pending status
   */
  router.post('/:id/reject', requirePermission('teacher-leaves.approve'), controller.reject);

  /**
   * @openapi
   * /teacher-leaves/{id}/cancel:
   *   post:
   *     tags: [Teachers]
   *     summary: Cancel a leave request
   *     description: |
   *       Cancel an approved or pending leave request.
   *       Teachers can cancel their own requests before the start date.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Teacher leave ID
   *     responses:
   *       200:
   *         description: Leave request cancelled successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/TeacherLeave'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   *       409:
   *         description: Cannot cancel leave that has already started or is rejected
   */
  router.post('/:id/cancel', requirePermission('teacher-leaves.create'), controller.cancel);

  return router;
}
