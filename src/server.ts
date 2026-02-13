import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.ts';
import { logger } from './shared/utils/logger.ts';
import { errorHandler } from './shared/errors/error-handler.ts';
import { requestId } from './shared/middleware/request-id.middleware.ts';
import { createContainer } from './container.ts';

// Route factories
import { createPlatformSchoolRoutes, createSchoolProfileRoutes } from './modules/school/school.routes.ts';
import { createAuthRoutes } from './modules/auth/auth.routes.ts';
import { createUserRoutes } from './modules/user/user.routes.ts';
import { createRoleRoutes } from './modules/role/role.routes.ts';
import { createPermissionRoutes } from './modules/permission/permission.routes.ts';

export function createServer() {
  const app = express();
  const { controllers, prisma } = createContainer();

  // ---- Global middleware ----
  app.use(requestId);
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' } }),
  );

  // ---- Health check ----
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ---- API routes ----
  // Platform (super admin)
  app.use('/api/v1/platform/schools', createPlatformSchoolRoutes(controllers.schoolController));

  // School profile (school admin)
  app.use('/api/v1/school/profile', createSchoolProfileRoutes(controllers.schoolController));

  // Auth
  app.use('/api/v1/auth', createAuthRoutes(controllers.authController));

  // Users
  app.use('/api/v1/users', createUserRoutes(controllers.userController));

  // Roles
  app.use('/api/v1/roles', createRoleRoutes(controllers.roleController));

  // Permissions
  app.use('/api/v1/permissions', createPermissionRoutes(prisma));

  // ---- 404 handler ----
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route not found' },
    });
  });

  // ---- Error handler (must be last, must have 4 params) ----
  app.use(errorHandler);

  return app;
}
