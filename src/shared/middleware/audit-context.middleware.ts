import type { Request, Response, NextFunction } from 'express';
import { requestContext } from '../context/request-context.ts';
import type { JwtPayload } from '../types/index.ts';

export function auditContext(req: Request, _res: Response, next: NextFunction): void {
  const user = (req as unknown as Record<string, unknown>)['user'] as JwtPayload | undefined;
  const ctx = {
    userId: user?.sub ?? null,
    schoolId: user?.schoolId ?? null,
    ipAddress: (req.ip ?? req.socket.remoteAddress) ?? null,
    userAgent: req.headers['user-agent'] ?? null,
  };

  requestContext.run(ctx, () => {
    next();
  });
}
