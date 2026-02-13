import { Router } from 'express';
import type { ReportCardController } from './report-card.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createReportCardRoutes(controller: ReportCardController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('grades_entry.view'), controller.list);
  router.get('/:id', requirePermission('grades_entry.view'), controller.getById);
  router.post('/generate', requirePermission('grades_entry.publish'), controller.generate);
  router.patch('/:id/remarks', requirePermission('grades_entry.update'), controller.updateRemarks);

  return router;
}
