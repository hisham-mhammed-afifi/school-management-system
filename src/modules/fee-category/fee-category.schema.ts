import { z } from 'zod';

export const createFeeCategorySchema = z.object({
  name: z.string().min(1).max(100),
});

export const updateFeeCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listFeeCategoriesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'name']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateFeeCategoryInput = z.infer<typeof createFeeCategorySchema>;
export type UpdateFeeCategoryInput = z.infer<typeof updateFeeCategorySchema>;
export type ListFeeCategoriesQuery = z.infer<typeof listFeeCategoriesQuerySchema>;
