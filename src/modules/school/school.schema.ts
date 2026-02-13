import { z } from 'zod';

// ---- Base schema (mirrors Prisma model) ----
export const schoolSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(50),
  logoUrl: z.string().url().nullable(),
  timezone: z.string().min(1).max(50),
  defaultLocale: z.string().max(10),
  currency: z.string().length(3),
  country: z.string().max(100).nullable(),
  city: z.string().max(100).nullable(),
  address: z.string().nullable(),
  phone: z.string().max(20).nullable(),
  email: z.string().email().max(255).nullable(),
  website: z.string().url().max(255).nullable(),
  subscriptionPlan: z.enum(['free', 'basic', 'premium', 'enterprise']),
  subscriptionExpiresAt: z.coerce.date().nullable(),
  status: z.enum(['active', 'suspended', 'archived']),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// ---- Platform: create school (super admin) ----
export const createSchoolSchema = z.object({
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Code must be lowercase alphanumeric with hyphens'),
  timezone: z.string().min(1).max(50),
  defaultLocale: z.string().max(10).default('en'),
  currency: z.string().length(3).default('USD'),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  address: z.string().optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional(),
  website: z.string().url().max(255).optional(),
  subscriptionPlan: z.enum(['free', 'basic', 'premium', 'enterprise']),
});

// ---- Platform: update school (super admin) ----
export const updateSchoolSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  logoUrl: z.string().url().optional(),
  timezone: z.string().min(1).max(50).optional(),
  defaultLocale: z.string().max(10).optional(),
  currency: z.string().length(3).optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  address: z.string().optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional(),
  website: z.string().url().max(255).optional(),
  subscriptionPlan: z.enum(['free', 'basic', 'premium', 'enterprise']).optional(),
  subscriptionExpiresAt: z.coerce.date().optional(),
  status: z.enum(['active', 'suspended', 'archived']).optional(),
});

// ---- School profile: update (school admin, restricted fields) ----
export const updateSchoolProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  logoUrl: z.string().url().optional(),
  address: z.string().optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional(),
  website: z.string().url().max(255).optional(),
});

// ---- ID param ----
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// ---- List query ----
export const listSchoolsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'name', 'code']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['active', 'suspended', 'archived']).optional(),
  plan: z.enum(['free', 'basic', 'premium', 'enterprise']).optional(),
  search: z.string().max(255).optional(),
});

// ---- Derived types ----
export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;
export type UpdateSchoolProfileInput = z.infer<typeof updateSchoolProfileSchema>;
export type ListSchoolsQuery = z.infer<typeof listSchoolsQuerySchema>;
