import type { Request, Response, NextFunction } from 'express';
import * as jose from 'jose';
import { AppError } from '../errors/app-error.ts';
import { env } from '../../config/env.ts';
import type { JwtPayload } from '../types/index.ts';
import { updateRequestContext } from '../context/request-context.ts';

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError('Missing or invalid authorization header', 401, 'UNAUTHORIZED');
  }

  const token = header.slice(7);
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const user = payload as unknown as JwtPayload;
    (req as unknown as Record<string, unknown>)['user'] = user;
    updateRequestContext({ userId: user.sub, schoolId: user.schoolId });
    next();
  } catch {
    throw new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
  }
}

export function requirePermission(...permissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as unknown as Record<string, unknown>)['user'] as JwtPayload | undefined;
    if (!user) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const hasPermission = permissions.some((p) => user.permissions.includes(p));
    if (!hasPermission) {
      throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
    }

    next();
  };
}

export function extractSchoolId(req: Request): string {
  const user = (req as unknown as Record<string, unknown>)['user'] as JwtPayload | undefined;
  if (!user) {
    throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
  }

  // Super admins pass school ID via header
  if (user.schoolId === null) {
    const headerSchoolId = req.headers['x-school-id'] as string | undefined;
    if (!headerSchoolId) {
      throw new AppError('X-School-Id header required for super admin', 400, 'MISSING_SCHOOL_ID');
    }
    return headerSchoolId;
  }

  return user.schoolId;
}
