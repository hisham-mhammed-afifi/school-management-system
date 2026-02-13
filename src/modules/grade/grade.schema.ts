import { z } from 'zod';

export const createGradeSchema = z.object({
  name: z.string().min(1).max(50),
  levelOrder: z.number().int().positive(),
});

export const updateGradeSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  levelOrder: z.number().int().positive().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listGradesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export type CreateGradeInput = z.infer<typeof createGradeSchema>;
export type UpdateGradeInput = z.infer<typeof updateGradeSchema>;
export type ListGradesQuery = z.infer<typeof listGradesQuerySchema>;
