import { z } from 'zod';

export const createGuardianSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().min(1).max(20),
  email: z.string().email().max(255).optional(),
  nationalId: z.string().max(30).optional(),
  occupation: z.string().max(100).optional(),
  address: z.string().optional(),
});

export const updateGuardianSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().min(1).max(20).optional(),
  email: z.string().email().max(255).nullable().optional(),
  nationalId: z.string().max(30).nullable().optional(),
  occupation: z.string().max(100).nullable().optional(),
  address: z.string().nullable().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listGuardiansQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'firstName', 'lastName']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().max(255).optional(),
});

export type CreateGuardianInput = z.infer<typeof createGuardianSchema>;
export type UpdateGuardianInput = z.infer<typeof updateGuardianSchema>;
export type ListGuardiansQuery = z.infer<typeof listGuardiansQuerySchema>;
