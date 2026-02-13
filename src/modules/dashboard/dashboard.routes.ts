import { Router } from 'express';
import type { DashboardController } from './dashboard.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createDashboardRoutes(controller: DashboardController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/overview', requirePermission('dashboard.view'), controller.overview);
  router.get('/attendance-today', requirePermission('dashboard.view'), controller.attendanceToday);
  router.get('/fees-summary', requirePermission('dashboard.view'), controller.feesSummary);
  router.get('/recent-activity', requirePermission('dashboard.view'), controller.recentActivity);

  return router;
}

export function createPlatformDashboardRoutes(controller: DashboardController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/dashboard', requirePermission('platform.manage'), controller.platformDashboard);
  router.get('/schools/expiring', requirePermission('platform.manage'), controller.expiringSchools);

  return router;
}
