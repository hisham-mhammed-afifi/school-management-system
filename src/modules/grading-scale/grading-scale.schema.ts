import { z } from 'zod';

const gradingScaleLevelSchema = z.object({
  letter: z.string().max(5),
  minScore: z.number().min(0).max(100),
  maxScore: z.number().min(0).max(100),
  gpaPoints: z.number().min(0).max(9.99).optional(),
  orderIndex: z.number().int().positive(),
});

export const createGradingScaleSchema = z.object({
  name: z.string().min(1).max(50),
  levels: z.array(gradingScaleLevelSchema).min(1),
});

export const updateGradingScaleSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  levels: z.array(gradingScaleLevelSchema).min(1).optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listGradingScalesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'name']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateGradingScaleInput = z.infer<typeof createGradingScaleSchema>;
export type UpdateGradingScaleInput = z.infer<typeof updateGradingScaleSchema>;
export type ListGradingScalesQuery = z.infer<typeof listGradingScalesQuerySchema>;
