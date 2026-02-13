import { z } from 'zod';

export const createEnrollmentSchema = z.object({
  studentId: z.string().uuid(),
  classSectionId: z.string().uuid(),
  academicYearId: z.string().uuid(),
  enrolledAt: z.coerce.date(),
  notes: z.string().optional(),
});

export const updateEnrollmentSchema = z.object({
  classSectionId: z.string().uuid().optional(),
  status: z.enum(['active', 'withdrawn', 'transferred', 'promoted']).optional(),
  withdrawnAt: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listEnrollmentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'enrolledAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['active', 'withdrawn', 'transferred', 'promoted']).optional(),
  academicYearId: z.string().uuid().optional(),
  classSectionId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
});

export const bulkPromoteSchema = z.object({
  sourceClassSectionId: z.string().uuid(),
  targetClassSectionId: z.string().uuid(),
  targetAcademicYearId: z.string().uuid(),
  studentIds: z.array(z.string().uuid()).min(1),
});

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;
export type ListEnrollmentsQuery = z.infer<typeof listEnrollmentsQuerySchema>;
export type BulkPromoteInput = z.infer<typeof bulkPromoteSchema>;
