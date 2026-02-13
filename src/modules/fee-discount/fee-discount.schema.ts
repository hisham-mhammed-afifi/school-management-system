import { z } from 'zod';

export const discountTypeEnum = z.enum(['percentage', 'fixed']);

export const createFeeDiscountSchema = z.object({
  studentId: z.string().uuid(),
  feeStructureId: z.string().uuid(),
  discountType: discountTypeEnum,
  amount: z.number().positive(),
  reason: z.string().max(500).optional(),
}).refine(
  (data) => !(data.discountType === 'percentage' && data.amount > 100),
  { message: 'Percentage discount cannot exceed 100', path: ['amount'] },
);

export const updateFeeDiscountSchema = z.object({
  discountType: discountTypeEnum.optional(),
  amount: z.number().positive().optional(),
  reason: z.string().max(500).optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listFeeDiscountsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  studentId: z.string().uuid().optional(),
  feeStructureId: z.string().uuid().optional(),
});

export type CreateFeeDiscountInput = z.infer<typeof createFeeDiscountSchema>;
export type UpdateFeeDiscountInput = z.infer<typeof updateFeeDiscountSchema>;
export type ListFeeDiscountsQuery = z.infer<typeof listFeeDiscountsQuerySchema>;
