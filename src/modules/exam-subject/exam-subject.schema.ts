import { z } from 'zod';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createExamSubjectSchema = z.object({
  subjectId: z.string().uuid(),
  gradeId: z.string().uuid(),
  maxScore: z.number().positive().max(999),
  passScore: z.number().min(0).optional(),
  examDate: z.coerce.date().optional(),
  examTime: z.string().regex(TIME_REGEX, 'Must be HH:MM format').optional(),
});

export const updateExamSubjectSchema = z.object({
  maxScore: z.number().positive().max(999).optional(),
  passScore: z.number().min(0).optional(),
  examDate: z.coerce.date().optional(),
  examTime: z.string().regex(TIME_REGEX, 'Must be HH:MM format').optional(),
});

export const examIdParamSchema = z.object({
  examId: z.string().uuid('Invalid exam ID format'),
});

export const examSubjectIdParamSchema = z.object({
  examId: z.string().uuid('Invalid exam ID format'),
  id: z.string().uuid('Invalid ID format'),
});

export type CreateExamSubjectInput = z.infer<typeof createExamSubjectSchema>;
export type UpdateExamSubjectInput = z.infer<typeof updateExamSubjectSchema>;
