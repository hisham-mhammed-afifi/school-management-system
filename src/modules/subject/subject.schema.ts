import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20),
  isLab: z.boolean().default(false),
  isElective: z.boolean().default(false),
});

export const updateSubjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(1).max(20).optional(),
  isLab: z.boolean().optional(),
  isElective: z.boolean().optional(),
});

export const setSubjectGradesSchema = z.object({
  gradeIds: z.array(z.string().uuid()),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const subjectIdParamSchema = z.object({
  subjectId: z.string().uuid('Invalid subject ID'),
});

export const gradeIdParamSchema = z.object({
  gradeId: z.string().uuid('Invalid grade ID'),
});

export const listSubjectsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  search: z.string().max(255).optional(),
  gradeId: z.string().uuid().optional(),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type SetSubjectGradesInput = z.infer<typeof setSubjectGradesSchema>;
export type ListSubjectsQuery = z.infer<typeof listSubjectsQuerySchema>;
