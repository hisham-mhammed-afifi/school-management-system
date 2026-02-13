import { z } from 'zod';

export const sectionIdParamSchema = z.object({
  sectionId: z.string().uuid('Invalid section ID'),
});

export const setRequirementsSchema = z.object({
  requirements: z.array(
    z.object({
      subjectId: z.string().uuid(),
      weeklyLessonsRequired: z.number().int().positive(),
    }),
  ),
});

export type SetRequirementsInput = z.infer<typeof setRequirementsSchema>;
