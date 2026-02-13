import { z } from 'zod';

export const createTeacherLeaveSchema = z.object({
  teacherId: z.string().uuid(),
  leaveType: z.enum(['sick', 'personal', 'maternity', 'paternity', 'annual', 'unpaid', 'other']),
  dateFrom: z.coerce.date(),
  dateTo: z.coerce.date(),
  reason: z.string().max(500).optional(),
}).refine((data) => data.dateTo >= data.dateFrom, {
  message: 'dateTo must be on or after dateFrom',
  path: ['dateTo'],
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listTeacherLeavesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'dateFrom']).default('dateFrom'),
  order: z.enum(['asc', 'desc']).default('desc'),
  teacherId: z.string().uuid().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),
});

export type CreateTeacherLeaveInput = z.infer<typeof createTeacherLeaveSchema>;
export type ListTeacherLeavesQuery = z.infer<typeof listTeacherLeavesQuerySchema>;
