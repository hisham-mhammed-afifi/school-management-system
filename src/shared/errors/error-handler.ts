import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../../generated/prisma/client.ts';
import { AppError } from './app-error.ts';
import { logger } from '../utils/logger.ts';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Operational errors (expected)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  // Validation errors
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: err.issues.map((e) => ({
          path: e.path.map(String).join('.'),
          message: e.message,
        })),
      },
    });
    return;
  }

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const target = (err.meta?.['target'] as string[])?.join(', ') ?? 'field';
        res.status(409).json({
          success: false,
          error: { code: 'UNIQUE_VIOLATION', message: `Duplicate value for: ${target}` },
        });
        return;
      }
      case 'P2025':
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Record not found' },
        });
        return;
      case 'P2003':
        res.status(400).json({
          success: false,
          error: { code: 'FK_VIOLATION', message: 'Referenced record does not exist' },
        });
        return;
    }
  }

  // Unexpected errors
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error({ err: error }, 'Unhandled error');
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
}
