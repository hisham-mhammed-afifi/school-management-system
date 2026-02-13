import { Router } from 'express';
import type { FeeInvoiceController } from './fee-invoice.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createFeeInvoiceRoutes(controller: FeeInvoiceController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('fees.view'), controller.list);
  router.get('/:id', requirePermission('fees.view'), controller.getById);
  router.post('/', requirePermission('fees.create_invoice'), controller.create);
  router.post('/bulk-generate', requirePermission('fees.create_invoice'), controller.bulkGenerate);
  router.post('/:id/issue', requirePermission('fees.issue_invoice'), controller.issue);
  router.post('/:id/cancel', requirePermission('fees.cancel_invoice'), controller.cancel);

  return router;
}
