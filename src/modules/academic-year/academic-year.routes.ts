import { Router } from 'express';
import type { AcademicYearController } from './academic-year.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createAcademicYearRoutes(controller: AcademicYearController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('academic_years.view'), controller.list);
  router.get('/:id', requirePermission('academic_years.view'), controller.getById);
  router.post('/', requirePermission('academic_years.create'), controller.create);
  router.patch('/:id', requirePermission('academic_years.update'), controller.update);
  router.post('/:id/activate', requirePermission('academic_years.activate'), controller.activate);
  router.delete('/:id', requirePermission('academic_years.delete'), controller.remove);

  return router;
}
