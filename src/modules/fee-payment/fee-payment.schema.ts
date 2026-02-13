import { z } from 'zod';

export const paymentMethodEnum = z.enum(['cash', 'bank_transfer', 'card', 'cheque', 'online']);

export const createFeePaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amountPaid: z.number().positive(),
  paymentDate: z.coerce.date(),
  paymentMethod: paymentMethodEnum,
  referenceNumber: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listFeePaymentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'paymentDate', 'amountPaid']).default('paymentDate'),
  order: z.enum(['asc', 'desc']).default('desc'),
  invoiceId: z.string().uuid().optional(),
  paymentMethod: paymentMethodEnum.optional(),
});

export type CreateFeePaymentInput = z.infer<typeof createFeePaymentSchema>;
export type ListFeePaymentsQuery = z.infer<typeof listFeePaymentsQuerySchema>;
