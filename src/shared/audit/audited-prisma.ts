import type { PrismaClient } from '../../generated/prisma/client.ts';
import { getRequestContext } from '../context/request-context.ts';
import { logger } from '../utils/logger.ts';

// Models to audit and which actions to track
const AUDITED_MODELS: Record<string, Set<string>> = {
  studentGrade: new Set(['create', 'update', 'delete']),
  feeInvoice: new Set(['create', 'update', 'delete']),
  feePayment: new Set(['create', 'update', 'delete']),
  lesson: new Set(['create', 'update', 'delete']),
  studentEnrollment: new Set(['create', 'update']),
  teacherLeave: new Set(['update']),
  substitution: new Set(['create', 'update', 'delete']),
  user: new Set(['update']),
};

// Map Prisma model names to DB table names
const MODEL_TABLE_MAP: Record<string, string> = {
  studentGrade: 'student_grades',
  feeInvoice: 'fee_invoices',
  feePayment: 'fee_payments',
  lesson: 'lessons',
  studentEnrollment: 'student_enrollments',
  teacherLeave: 'teacher_leaves',
  substitution: 'substitutions',
  user: 'users',
};

type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE';

async function writeAuditLog(
  prisma: PrismaClient,
  params: {
    schoolId: string | null;
    tableName: string;
    recordId: string;
    action: AuditAction;
    oldValues: unknown;
    newValues: unknown;
  },
): Promise<void> {
  const ctx = getRequestContext();
  const schoolId = params.schoolId ?? ctx.schoolId;

  if (!schoolId) return;

  try {
    await prisma.auditLog.create({
      data: {
        schoolId,
        userId: ctx.userId,
        tableName: params.tableName,
        recordId: params.recordId,
        action: params.action,
        oldValues: params.oldValues ? JSON.parse(JSON.stringify(params.oldValues)) : null,
        newValues: params.newValues ? JSON.parse(JSON.stringify(params.newValues)) : null,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      },
    });
  } catch (err) {
    logger.error({ err, audit: params }, 'Failed to write audit log');
  }
}

function extractId(result: unknown): string | null {
  if (result && typeof result === 'object' && 'id' in result) {
    return String((result as Record<string, unknown>)['id']);
  }
  return null;
}

function extractSchoolId(result: unknown): string | null {
  if (result && typeof result === 'object' && 'schoolId' in result) {
    return String((result as Record<string, unknown>)['schoolId']);
  }
  return null;
}

export function createAuditedPrisma(basePrisma: PrismaClient) {
  return basePrisma.$extends({
    query: {
      $allModels: {
        async create({ model, args, query }) {
          const result = await query(args);
          const modelName = model as string;
          const audited = AUDITED_MODELS[modelName];
          if (audited?.has('create')) {
            const tableName = MODEL_TABLE_MAP[modelName];
            const recordId = extractId(result);
            const schoolId = extractSchoolId(result);
            if (tableName && recordId) {
              void writeAuditLog(basePrisma, {
                schoolId,
                tableName,
                recordId,
                action: 'INSERT',
                oldValues: null,
                newValues: result,
              });
            }
          }
          return result;
        },

        async update({ model, args, query }) {
          const modelName = model as string;
          const audited = AUDITED_MODELS[modelName];

          let beforeImage: unknown = null;
          if (audited?.has('update') && args.where) {
            try {
              const delegate = (basePrisma as unknown as Record<string, { findUnique: (args: unknown) => Promise<unknown> } | undefined>)[modelName];
              if (delegate) {
                beforeImage = await delegate.findUnique({ where: args.where });
              }
            } catch {
              // If we can't get the before image, continue without it
            }
          }

          const result = await query(args);

          if (audited?.has('update')) {
            const tableName = MODEL_TABLE_MAP[modelName];
            const recordId = extractId(result) ?? extractId(beforeImage);
            const schoolId = extractSchoolId(result) ?? extractSchoolId(beforeImage);
            if (tableName && recordId) {
              void writeAuditLog(basePrisma, {
                schoolId,
                tableName,
                recordId,
                action: 'UPDATE',
                oldValues: beforeImage,
                newValues: result,
              });
            }
          }
          return result;
        },

        async delete({ model, args, query }) {
          const modelName = model as string;
          const audited = AUDITED_MODELS[modelName];

          let beforeImage: unknown = null;
          if (audited?.has('delete') && args.where) {
            try {
              const delegate = (basePrisma as unknown as Record<string, { findUnique: (args: unknown) => Promise<unknown> } | undefined>)[modelName];
              if (delegate) {
                beforeImage = await delegate.findUnique({ where: args.where });
              }
            } catch {
              // If we can't get the before image, continue without it
            }
          }

          const result = await query(args);

          if (audited?.has('delete')) {
            const tableName = MODEL_TABLE_MAP[modelName];
            const recordId = extractId(beforeImage) ?? extractId(result);
            const schoolId = extractSchoolId(beforeImage) ?? extractSchoolId(result);
            if (tableName && recordId) {
              void writeAuditLog(basePrisma, {
                schoolId,
                tableName,
                recordId,
                action: 'DELETE',
                oldValues: beforeImage,
                newValues: null,
              });
            }
          }
          return result;
        },
      },
    },
  });
}
