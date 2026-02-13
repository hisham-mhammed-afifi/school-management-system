import { z } from 'zod';

export const recurrenceEnum = z.enum(['monthly', 'quarterly', 'term', 'annual']);

export const createFeeStructureSchema = z.object({
  academicYearId: z.string().uuid(),
  gradeId: z.string().uuid(),
  feeCategoryId: z.string().uuid(),
  name: z.string().min(1).max(100),
  amount: z.number().positive(),
  dueDate: z.coerce.date().optional(),
  isRecurring: z.boolean().default(false),
  recurrence: recurrenceEnum.optional(),
}).refine(
  (data) => {
    if (data.isRecurring && !data.recurrence) return false;
    if (!data.isRecurring && data.recurrence) return false;
    return true;
  },
  { message: 'recurrence is required when isRecurring is true and must be null when false', path: ['recurrence'] },
);

export const updateFeeStructureSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  amount: z.number().positive().optional(),
  dueDate: z.coerce.date().optional(),
  isRecurring: z.boolean().optional(),
  recurrence: recurrenceEnum.optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listFeeStructuresQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'name', 'amount']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
  academicYearId: z.string().uuid().optional(),
  gradeId: z.string().uuid().optional(),
  feeCategoryId: z.string().uuid().optional(),
  isRecurring: z.coerce.boolean().optional(),
});

export type CreateFeeStructureInput = z.infer<typeof createFeeStructureSchema>;
export type UpdateFeeStructureInput = z.infer<typeof updateFeeStructureSchema>;
export type ListFeeStructuresQuery = z.infer<typeof listFeeStructuresQuerySchema>;
