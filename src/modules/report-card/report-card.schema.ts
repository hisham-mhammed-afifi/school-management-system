import { z } from 'zod';

export const generateReportCardsSchema = z.object({
  termId: z.string().uuid(),
  classSectionId: z.string().uuid(),
});

export const updateRemarksSchema = z.object({
  teacherRemarks: z.string().max(1000).optional(),
  rankInClass: z.number().int().positive().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listReportCardsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['generatedAt', 'overallPercentage', 'rankInClass']).default('generatedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  termId: z.string().uuid().optional(),
  classSectionId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
});

export type GenerateReportCardsInput = z.infer<typeof generateReportCardsSchema>;
export type UpdateRemarksInput = z.infer<typeof updateRemarksSchema>;
export type ListReportCardsQuery = z.infer<typeof listReportCardsQuerySchema>;
