import { Router } from 'express';
import type { PrismaClient } from '../../generated/prisma/client.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createPermissionRoutes(db: PrismaClient): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', requirePermission('roles.view'), async (_req, res) => {
    const permissions = await db.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
      select: { id: true, name: true, module: true, action: true },
    });
    res.json({ success: true, data: permissions });
  });

  return router;
}
