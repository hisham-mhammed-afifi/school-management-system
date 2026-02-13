import { z } from 'zod';

// ---- Create role ----
export const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
});

// ---- Update role ----
export const updateRoleSchema = z.object({
  name: z.string().min(1).max(100),
});

// ---- Set permissions (full replace) ----
export const setRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string().uuid()),
});

// ---- ID param ----
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// ---- List query ----
export const listRolesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(255).optional(),
});

// ---- Derived types ----
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type SetRolePermissionsInput = z.infer<typeof setRolePermissionsSchema>;
export type ListRolesQuery = z.infer<typeof listRolesQuerySchema>;
