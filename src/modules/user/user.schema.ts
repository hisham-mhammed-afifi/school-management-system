import { z } from 'zod';

// ---- Create user ----
export const createUserSchema = z
  .object({
    email: z.string().email().max(255),
    phone: z.string().max(20).optional(),
    password: z.string().min(8).max(128),
    teacherId: z.string().uuid().optional(),
    studentId: z.string().uuid().optional(),
    guardianId: z.string().uuid().optional(),
    roleIds: z.array(z.string().uuid()).min(1),
  })
  .refine(
    (data) => {
      const count = [data.teacherId, data.studentId, data.guardianId].filter(Boolean).length;
      return count <= 1;
    },
    { message: 'At most one of teacherId, studentId, guardianId can be set', path: ['teacherId'] },
  );

// ---- Update user ----
export const updateUserSchema = z.object({
  email: z.string().email().max(255).optional(),
  phone: z.string().max(20).optional(),
  isActive: z.boolean().optional(),
});

// ---- Assign role ----
export const assignRoleSchema = z.object({
  roleId: z.string().uuid(),
  schoolId: z.string().uuid().optional(),
});

// ---- ID params ----
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const userRoleParamsSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
  roleId: z.string().uuid('Invalid role ID format'),
});

// ---- List query ----
export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'email', 'lastLoginAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  roleId: z.string().uuid().optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  search: z.string().max(255).optional(),
});

// ---- Remove role query ----
export const removeRoleQuerySchema = z.object({
  schoolId: z.string().uuid().optional(),
});

// ---- Derived types ----
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
