import { z } from 'zod';

export const studentAttendanceStatusEnum = z.enum(['present', 'absent', 'late', 'excused']);

const attendanceRecord = z.object({
  studentId: z.string().uuid(),
  status: studentAttendanceStatusEnum,
  notes: z.string().max(500).optional(),
});

export const bulkStudentAttendanceSchema = z.object({
  classSectionId: z.string().uuid(),
  date: z.coerce.date(),
  lessonId: z.string().uuid().optional(),
  records: z.array(attendanceRecord).min(1),
});

export const correctStudentAttendanceSchema = z.object({
  status: studentAttendanceStatusEnum,
  notes: z.string().max(500).optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listStudentAttendanceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['date', 'createdAt']).default('date'),
  order: z.enum(['asc', 'desc']).default('desc'),
  classSectionId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  date: z.coerce.date().optional(),
  status: studentAttendanceStatusEnum.optional(),
});

export const attendanceSummaryQuerySchema = z.object({
  classSectionId: z.string().uuid(),
  dateFrom: z.coerce.date(),
  dateTo: z.coerce.date(),
  studentId: z.string().uuid().optional(),
});

export type BulkStudentAttendanceInput = z.infer<typeof bulkStudentAttendanceSchema>;
export type CorrectStudentAttendanceInput = z.infer<typeof correctStudentAttendanceSchema>;
export type ListStudentAttendanceQuery = z.infer<typeof listStudentAttendanceQuerySchema>;
export type AttendanceSummaryQuery = z.infer<typeof attendanceSummaryQuerySchema>;
