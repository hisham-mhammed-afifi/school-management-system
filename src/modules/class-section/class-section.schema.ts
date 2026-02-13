import { z } from 'zod';

export const createClassSectionSchema = z.object({
  academicYearId: z.string().uuid(),
  gradeId: z.string().uuid(),
  name: z.string().min(1).max(20),
  capacity: z.number().int().positive(),
  homeroomTeacherId: z.string().uuid().optional(),
});

export const updateClassSectionSchema = z.object({
  name: z.string().min(1).max(20).optional(),
  capacity: z.number().int().positive().optional(),
  homeroomTeacherId: z.string().uuid().nullable().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listClassSectionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  academicYearId: z.string().uuid().optional(),
  gradeId: z.string().uuid().optional(),
});

export type CreateClassSectionInput = z.infer<typeof createClassSectionSchema>;
export type UpdateClassSectionInput = z.infer<typeof updateClassSectionSchema>;
export type ListClassSectionsQuery = z.infer<typeof listClassSectionsQuerySchema>;
