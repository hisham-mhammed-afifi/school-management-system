import { Router } from 'express';
import type { FeePaymentController } from './fee-payment.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createFeePaymentRoutes(controller: FeePaymentController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('fees.view'), controller.list);
  router.get('/:id', requirePermission('fees.view'), controller.getById);
  router.post('/', requirePermission('fees.collect'), controller.create);

  return router;
}
