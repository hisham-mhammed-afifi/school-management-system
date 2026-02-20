import { Router } from 'express';
import type { PrismaClient } from '../../generated/prisma/client.ts';
import { authenticate, requirePermission } from '../../shared/middleware/auth.middleware.ts';

export function createPermissionRoutes(db: PrismaClient): Router {
  const router = Router();

  router.use(authenticate);

  /**
   * @openapi
   * /permissions:
   *   get:
   *     tags: [Roles]
   *     summary: List all permissions
   *     description: |
   *       Get a complete list of all available permissions in the system.
   *       Used for role configuration and permission assignment.
   *     responses:
   *       200:
   *         description: Permissions retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Permission'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   */
  router.get('/', requirePermission('roles.list'), async (_req, res) => {
    const permissions = await db.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
      select: { id: true, name: true, module: true, action: true },
    });
    res.json({ success: true, data: permissions });
  });

  return router;
}
