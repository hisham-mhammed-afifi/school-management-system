import { z } from 'zod';

export const auditActionEnum = z.enum(['INSERT', 'UPDATE', 'DELETE']);

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listAuditLogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  tableName: z.string().max(100).optional(),
  recordId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  action: auditActionEnum.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;
