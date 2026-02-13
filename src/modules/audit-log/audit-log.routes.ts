import { Router } from 'express';
import type { AuditLogController } from './audit-log.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createAuditLogRoutes(controller: AuditLogController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('audit.view'), controller.list);
  router.get('/:id', requirePermission('audit.view'), controller.getById);

  return router;
}
