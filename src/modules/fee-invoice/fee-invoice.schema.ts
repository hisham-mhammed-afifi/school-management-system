import { z } from 'zod';

export const invoiceStatusEnum = z.enum(['draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled']);

const invoiceItemInput = z.object({
  feeStructureId: z.string().uuid(),
  description: z.string().max(255).optional(),
  quantity: z.number().int().positive().default(1),
  unitAmount: z.number().positive(),
});

export const createFeeInvoiceSchema = z.object({
  studentId: z.string().uuid(),
  dueDate: z.coerce.date(),
  items: z.array(invoiceItemInput).min(1),
});

export const bulkGenerateSchema = z.object({
  academicYearId: z.string().uuid(),
  gradeId: z.string().uuid(),
  dueDate: z.coerce.date(),
  feeStructureIds: z.array(z.string().uuid()).min(1),
});

export const issueInvoiceSchema = z.object({
  notifyGuardian: z.boolean().default(false),
});

export const cancelInvoiceSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listFeeInvoicesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'dueDate', 'netAmount']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  studentId: z.string().uuid().optional(),
  status: invoiceStatusEnum.optional(),
});

export type CreateFeeInvoiceInput = z.infer<typeof createFeeInvoiceSchema>;
export type BulkGenerateInput = z.infer<typeof bulkGenerateSchema>;
export type IssueInvoiceInput = z.infer<typeof issueInvoiceSchema>;
export type CancelInvoiceInput = z.infer<typeof cancelInvoiceSchema>;
export type ListFeeInvoicesQuery = z.infer<typeof listFeeInvoicesQuerySchema>;
