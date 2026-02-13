import { z } from 'zod';

export const createStudentSchema = z.object({
  studentCode: z.string().min(1).max(30),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(['male', 'female']),
  nationalId: z.string().max(30).optional(),
  nationality: z.string().max(50).optional(),
  religion: z.string().max(50).optional(),
  bloodType: z.enum(['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG']).optional(),
  address: z.string().optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional(),
  photoUrl: z.string().url().optional(),
  medicalNotes: z.string().optional(),
  admissionDate: z.coerce.date(),
});

export const updateStudentSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(['male', 'female']).optional(),
  nationalId: z.string().max(30).nullable().optional(),
  nationality: z.string().max(50).nullable().optional(),
  religion: z.string().max(50).nullable().optional(),
  bloodType: z.enum(['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG']).nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  email: z.string().email().max(255).nullable().optional(),
  photoUrl: z.string().url().nullable().optional(),
  medicalNotes: z.string().nullable().optional(),
  status: z.enum(['active', 'graduated', 'withdrawn', 'suspended', 'transferred']).optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listStudentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'firstName', 'lastName', 'studentCode']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['active', 'graduated', 'withdrawn', 'suspended', 'transferred']).optional(),
  gradeId: z.string().uuid().optional(),
  classSectionId: z.string().uuid().optional(),
  search: z.string().max(255).optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type ListStudentsQuery = z.infer<typeof listStudentsQuerySchema>;
