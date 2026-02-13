import { z } from 'zod';

const gradeEntry = z.object({
  studentId: z.string().uuid(),
  score: z.number().min(0),
  notes: z.string().max(500).optional(),
});

export const bulkGradeSchema = z.object({
  examSubjectId: z.string().uuid(),
  grades: z.array(gradeEntry).min(1),
});

export const correctGradeSchema = z.object({
  score: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listGradesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  sortBy: z.enum(['createdAt', 'score']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  examSubjectId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
});

export const gradeReportQuerySchema = z.object({
  termId: z.string().uuid(),
  classSectionId: z.string().uuid(),
});

export type BulkGradeInput = z.infer<typeof bulkGradeSchema>;
export type CorrectGradeInput = z.infer<typeof correctGradeSchema>;
export type ListGradesQuery = z.infer<typeof listGradesQuerySchema>;
export type GradeReportQuery = z.infer<typeof gradeReportQuerySchema>;
