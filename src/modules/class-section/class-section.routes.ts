import { Router } from 'express';
import type { ClassSectionController } from './class-section.controller.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createClassSectionRoutes(controller: ClassSectionController): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('class_sections.view'), controller.list);
  router.get('/:id', requirePermission('class_sections.view'), controller.getById);
  router.post('/', requirePermission('class_sections.create'), controller.create);
  router.patch('/:id', requirePermission('class_sections.update'), controller.update);
  router.delete('/:id', requirePermission('class_sections.delete'), controller.remove);

  return router;
}
