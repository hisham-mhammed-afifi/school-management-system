import { z } from 'zod';

export const createSubstitutionSchema = z.object({
  lessonId: z.string().uuid(),
  substituteTeacherId: z.string().uuid(),
  date: z.coerce.date(),
  reason: z.string().optional(),
});

export const updateSubstitutionSchema = z.object({
  substituteTeacherId: z.string().uuid().optional(),
  date: z.coerce.date().optional(),
  reason: z.string().nullable().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listSubstitutionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  date: z.coerce.date().optional(),
  teacherId: z.string().uuid().optional(),
  sortBy: z.enum(['date', 'createdAt']).default('date'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateSubstitutionInput = z.infer<typeof createSubstitutionSchema>;
export type UpdateSubstitutionInput = z.infer<typeof updateSubstitutionSchema>;
export type ListSubstitutionsQuery = z.infer<typeof listSubstitutionsQuerySchema>;
