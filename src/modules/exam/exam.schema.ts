import { z } from 'zod';

export const examTypeEnum = z.enum(['quiz', 'midterm', 'final', 'assignment', 'practical']);

export const createExamSchema = z.object({
  academicYearId: z.string().uuid(),
  termId: z.string().uuid(),
  gradingScaleId: z.string().uuid(),
  name: z.string().min(1).max(100),
  examType: examTypeEnum,
  weight: z.number().min(0).max(100).default(100),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const updateExamSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  examType: examTypeEnum.optional(),
  weight: z.number().min(0).max(100).optional(),
  gradingScaleId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listExamsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'name', 'startDate']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  termId: z.string().uuid().optional(),
  examType: examTypeEnum.optional(),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;
export type ListExamsQuery = z.infer<typeof listExamsQuerySchema>;
