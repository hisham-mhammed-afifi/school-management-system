import { z } from 'zod';

export const announcementTargetTypeEnum = z.enum(['all', 'role', 'grade', 'class_section']);

const targetSchema = z
  .object({
    targetType: announcementTargetTypeEnum,
    targetRoleId: z.string().uuid().optional(),
    targetGradeId: z.string().uuid().optional(),
    targetClassSectionId: z.string().uuid().optional(),
  })
  .refine(
    (t) => {
      if (t.targetType === 'role') return !!t.targetRoleId;
      if (t.targetType === 'grade') return !!t.targetGradeId;
      if (t.targetType === 'class_section') return !!t.targetClassSectionId;
      return true;
    },
    { message: 'Target ID must be provided for the selected target type', path: ['targetType'] },
  );

export const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(255),
  body: z.string().min(1),
  expiresAt: z.coerce.date().optional(),
  targets: z.array(targetSchema).min(1),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  body: z.string().min(1).optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  targets: z.array(targetSchema).min(1).optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listAnnouncementsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'publishedAt', 'title']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  isDraft: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  targetType: announcementTargetTypeEnum.optional(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type ListAnnouncementsQuery = z.infer<typeof listAnnouncementsQuerySchema>;
