import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = (req.headers['x-request-id'] as string) ?? randomUUID();
  (req as unknown as Record<string, unknown>)['id'] = id;
  res.setHeader('x-request-id', id);
  next();
}
