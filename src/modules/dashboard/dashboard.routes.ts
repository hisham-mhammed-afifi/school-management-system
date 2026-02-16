import { Router } from 'express';
import type { DashboardController } from './dashboard.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createDashboardRoutes(controller: DashboardController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /dashboard/overview:
   *   get:
   *     tags: [Dashboard]
   *     summary: Get dashboard overview statistics
   *     description: |
   *       Get high-level statistics for the current school including:
   *       - Total students, teachers, and classes
   *       - Active enrollments count
   *       - Other key metrics
   *     responses:
   *       200:
   *         description: Dashboard overview retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/DashboardOverview'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/overview', requirePermission('dashboard.view'), controller.overview);

  /**
   * @openapi
   * /dashboard/attendance-today:
   *   get:
   *     tags: [Dashboard]
   *     summary: Get today's attendance statistics
   *     description: |
   *       Get attendance statistics for the current day including:
   *       - Student attendance breakdown (present, absent, late, excused)
   *       - Teacher attendance breakdown (present, absent, late, on leave)
   *       - Attendance rates
   *     responses:
   *       200:
   *         description: Attendance statistics retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/AttendanceToday'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/attendance-today', requirePermission('dashboard.view'), controller.attendanceToday);

  /**
   * @openapi
   * /dashboard/fees-summary:
   *   get:
   *     tags: [Dashboard]
   *     summary: Get fees collection summary
   *     description: |
   *       Get financial statistics for the current school including:
   *       - Total invoiced amount
   *       - Total collected amount
   *       - Outstanding balance
   *       - Collection rate percentage
   *       - Count of overdue invoices
   *     parameters:
   *       - in: query
   *         name: academicYearId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by specific academic year (defaults to current year)
   *     responses:
   *       200:
   *         description: Fees summary retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   $ref: '#/components/schemas/FeesSummary'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/fees-summary', requirePermission('dashboard.view'), controller.feesSummary);

  /**
   * @openapi
   * /dashboard/recent-activity:
   *   get:
   *     tags: [Dashboard]
   *     summary: Get recent activity log
   *     description: |
   *       Get a timeline of recent activities in the school including:
   *       - New student enrollments
   *       - Grade submissions
   *       - Announcements
   *       - Fee payments
   *       - Other significant events
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Number of activities to retrieve
   *     responses:
   *       200:
   *         description: Recent activities retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id: { type: string, format: uuid }
   *                       activityType: { type: string, example: 'enrollment_created' }
   *                       description: { type: string }
   *                       timestamp: { type: string, format: date-time }
   *                       actorId: { type: string, format: uuid, nullable: true }
   *                       actorName: { type: string, nullable: true }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/recent-activity', requirePermission('dashboard.view'), controller.recentActivity);

  return router;
}

export function createPlatformDashboardRoutes(controller: DashboardController): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /platform/dashboard:
   *   get:
   *     tags: [Dashboard]
   *     summary: Get platform dashboard (super admin)
   *     description: |
   *       Get platform-wide statistics for super administrators including:
   *       - Total schools count by status
   *       - Total users across all schools
   *       - Revenue metrics
   *       - Subscription distribution
   *       - System health metrics
   *     responses:
   *       200:
   *         description: Platform dashboard retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: object
   *                   properties:
   *                     totalSchools: { type: integer, example: 150 }
   *                     activeSchools: { type: integer, example: 142 }
   *                     suspendedSchools: { type: integer, example: 5 }
   *                     archivedSchools: { type: integer, example: 3 }
   *                     totalUsers: { type: integer, example: 8500 }
   *                     subscriptionDistribution:
   *                       type: object
   *                       properties:
   *                         free: { type: integer, example: 45 }
   *                         basic: { type: integer, example: 60 }
   *                         premium: { type: integer, example: 35 }
   *                         enterprise: { type: integer, example: 10 }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Only platform administrators can access this endpoint
   */
  router.get('/dashboard', requirePermission('platform.manage'), controller.platformDashboard);

  /**
   * @openapi
   * /platform/schools/expiring:
   *   get:
   *     tags: [Dashboard]
   *     summary: Get schools with expiring subscriptions
   *     description: |
   *       Get a list of schools whose subscriptions are expiring soon.
   *       Useful for proactive renewal outreach.
   *     parameters:
   *       - in: query
   *         name: days
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 90
   *           default: 30
   *         description: Number of days ahead to check for expiring subscriptions
   *     responses:
   *       200:
   *         description: Expiring schools retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id: { type: string, format: uuid }
   *                       name: { type: string }
   *                       subscriptionPlan: { type: string }
   *                       subscriptionExpiresAt: { type: string, format: date-time }
   *                       daysUntilExpiry: { type: integer }
   *                       contactEmail: { type: string, format: email, nullable: true }
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         description: Only platform administrators can access this endpoint
   */
  router.get('/schools/expiring', requirePermission('platform.manage'), controller.expiringSchools);

  return router;
}
