import { Router } from 'express';
import type { FinancialReportController } from './financial-report.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createFinancialReportRoutes(controller: FinancialReportController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/outstanding', requirePermission('fees.report'), controller.outstanding);
  router.get('/collection', requirePermission('fees.report'), controller.collection);
  router.get('/student-balance', requirePermission('fees.report'), controller.studentBalance);
  router.get('/category-breakdown', requirePermission('fees.report'), controller.categoryBreakdown);

  return router;
}
