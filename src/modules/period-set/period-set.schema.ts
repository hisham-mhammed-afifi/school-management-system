import { z } from 'zod';

export const createPeriodSetSchema = z.object({
  academicYearId: z.string().uuid(),
  name: z.string().min(1).max(50).default('Default'),
});

export const updatePeriodSetSchema = z.object({
  name: z.string().min(1).max(50),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listPeriodSetsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'name']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  academicYearId: z.string().uuid().optional(),
});

export type CreatePeriodSetInput = z.infer<typeof createPeriodSetSchema>;
export type UpdatePeriodSetInput = z.infer<typeof updatePeriodSetSchema>;
export type ListPeriodSetsQuery = z.infer<typeof listPeriodSetsQuerySchema>;
