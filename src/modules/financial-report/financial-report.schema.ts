import { z } from 'zod';

export const outstandingQuerySchema = z.object({
  academicYearId: z.string().uuid().optional(),
  gradeId: z.string().uuid().optional(),
  status: z.enum(['issued', 'partially_paid', 'overdue']).optional(),
});

export const collectionQuerySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'card', 'cheque', 'online']).optional(),
});

export const studentBalanceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  gradeId: z.string().uuid().optional(),
  search: z.string().max(255).optional(),
});

export const categoryBreakdownQuerySchema = z.object({
  academicYearId: z.string().uuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type OutstandingQuery = z.infer<typeof outstandingQuerySchema>;
export type CollectionQuery = z.infer<typeof collectionQuerySchema>;
export type StudentBalanceQuery = z.infer<typeof studentBalanceQuerySchema>;
export type CategoryBreakdownQuery = z.infer<typeof categoryBreakdownQuerySchema>;
