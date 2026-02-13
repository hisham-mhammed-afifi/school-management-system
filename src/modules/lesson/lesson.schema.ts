import { z } from 'zod';

export const createLessonSchema = z.object({
  academicYearId: z.string().uuid(),
  termId: z.string().uuid(),
  classSectionId: z.string().uuid(),
  subjectId: z.string().uuid(),
  teacherId: z.string().uuid(),
  roomId: z.string().uuid(),
  timeSlotId: z.string().uuid(),
});

export const updateLessonSchema = z.object({
  teacherId: z.string().uuid().optional(),
  roomId: z.string().uuid().optional(),
  timeSlotId: z.string().uuid().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listLessonsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  termId: z.string().uuid().optional(),
  classSectionId: z.string().uuid().optional(),
  teacherId: z.string().uuid().optional(),
  dayOfWeek: z.coerce.number().int().min(0).max(6).optional(),
  sortBy: z.enum(['createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const bulkCreateLessonsSchema = z.object({
  lessons: z.array(createLessonSchema).min(1),
});

export const autoGenerateSchema = z.object({
  termId: z.string().uuid(),
  periodSetId: z.string().uuid(),
  options: z.object({
    respectTeacherAvailability: z.boolean().default(true),
    respectRoomSuitability: z.boolean().default(true),
    maxConsecutiveLessonsPerTeacher: z.number().int().positive().default(4),
  }).default({
    respectTeacherAvailability: true,
    respectRoomSuitability: true,
    maxConsecutiveLessonsPerTeacher: 4,
  }),
});

export const clearLessonsQuerySchema = z.object({
  termId: z.string().uuid(),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type ListLessonsQuery = z.infer<typeof listLessonsQuerySchema>;
export type BulkCreateLessonsInput = z.infer<typeof bulkCreateLessonsSchema>;
export type AutoGenerateInput = z.infer<typeof autoGenerateSchema>;
