import { z } from 'zod';

export const createStudentGuardianSchema = z.object({
  guardianId: z.string().uuid(),
  relationshipType: z.enum(['father', 'mother', 'brother', 'sister', 'uncle', 'aunt', 'grandparent', 'other']),
  isPrimary: z.boolean().default(false),
  isEmergencyContact: z.boolean().default(false),
});

export const updateStudentGuardianSchema = z.object({
  relationshipType: z.enum(['father', 'mother', 'brother', 'sister', 'uncle', 'aunt', 'grandparent', 'other']).optional(),
  isPrimary: z.boolean().optional(),
  isEmergencyContact: z.boolean().optional(),
});

export const studentIdParamSchema = z.object({
  studentId: z.string().uuid('Invalid student ID format'),
});

export const idParamSchema = z.object({
  studentId: z.string().uuid('Invalid student ID format'),
  id: z.string().uuid('Invalid ID format'),
});

export type CreateStudentGuardianInput = z.infer<typeof createStudentGuardianSchema>;
export type UpdateStudentGuardianInput = z.infer<typeof updateStudentGuardianSchema>;
