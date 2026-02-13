import { z } from 'zod';

export const teacherAttendanceStatusEnum = z.enum(['present', 'absent', 'late', 'on_leave']);

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const recordTeacherAttendanceSchema = z.object({
  teacherId: z.string().uuid(),
  date: z.coerce.date(),
  status: teacherAttendanceStatusEnum,
  checkIn: z.string().regex(TIME_REGEX, 'Must be HH:MM format').optional(),
  checkOut: z.string().regex(TIME_REGEX, 'Must be HH:MM format').optional(),
});

export const correctTeacherAttendanceSchema = z.object({
  status: teacherAttendanceStatusEnum.optional(),
  checkIn: z.string().regex(TIME_REGEX, 'Must be HH:MM format').optional(),
  checkOut: z.string().regex(TIME_REGEX, 'Must be HH:MM format').optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listTeacherAttendanceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['date', 'createdAt']).default('date'),
  order: z.enum(['asc', 'desc']).default('desc'),
  teacherId: z.string().uuid().optional(),
  date: z.coerce.date().optional(),
  status: teacherAttendanceStatusEnum.optional(),
});

export type RecordTeacherAttendanceInput = z.infer<typeof recordTeacherAttendanceSchema>;
export type CorrectTeacherAttendanceInput = z.infer<typeof correctTeacherAttendanceSchema>;
export type ListTeacherAttendanceQuery = z.infer<typeof listTeacherAttendanceQuerySchema>;
