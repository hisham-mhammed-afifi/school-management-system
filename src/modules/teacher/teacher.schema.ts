import { z } from 'zod';

export const createTeacherSchema = z.object({
  teacherCode: z.string().min(1).max(30),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  gender: z.enum(['male', 'female']),
  nationalId: z.string().max(30).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional(),
  specialization: z.string().max(100).optional(),
  qualification: z.string().max(100).optional(),
  photoUrl: z.string().url().optional(),
  hireDate: z.coerce.date(),
  departmentId: z.string().uuid().nullable().optional(),
});

export const updateTeacherSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  gender: z.enum(['male', 'female']).optional(),
  nationalId: z.string().max(30).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  email: z.string().email().max(255).nullable().optional(),
  specialization: z.string().max(100).nullable().optional(),
  qualification: z.string().max(100).nullable().optional(),
  photoUrl: z.string().url().nullable().optional(),
  departmentId: z.string().uuid().nullable().optional(),
  status: z.enum(['active', 'on_leave', 'resigned', 'terminated']).optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listTeachersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'firstName', 'lastName', 'teacherCode']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['active', 'on_leave', 'resigned', 'terminated']).optional(),
  departmentId: z.string().uuid().optional(),
  search: z.string().max(255).optional(),
});

export const assignSubjectsSchema = z.object({
  subjectIds: z.array(z.string().uuid()).min(0),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
export type ListTeachersQuery = z.infer<typeof listTeachersQuerySchema>;
export type AssignSubjectsInput = z.infer<typeof assignSubjectsSchema>;
