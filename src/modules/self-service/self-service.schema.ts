import { z } from 'zod';

export const studentIdParamSchema = z.object({
  studentId: z.string().uuid('Invalid student ID format'),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const timetableQuerySchema = z.object({
  termId: z.string().uuid().optional(),
});

export const attendanceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const gradesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  termId: z.string().uuid().optional(),
  examId: z.string().uuid().optional(),
});

export const submitLeaveSchema = z.object({
  leaveType: z.enum(['sick', 'personal', 'maternity', 'paternity', 'annual', 'unpaid', 'other']),
  dateFrom: z.coerce.date(),
  dateTo: z.coerce.date(),
  reason: z.string().max(500).optional(),
}).refine((data) => data.dateTo >= data.dateFrom, {
  message: 'dateTo must be on or after dateFrom',
  path: ['dateTo'],
});

export type SubmitLeaveInput = z.infer<typeof submitLeaveSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type TimetableQuery = z.infer<typeof timetableQuerySchema>;
export type AttendanceQuery = z.infer<typeof attendanceQuerySchema>;
export type GradesQuery = z.infer<typeof gradesQuerySchema>;
