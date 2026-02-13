import { z } from 'zod';

export const eventTypeEnum = z.enum(['holiday', 'exam_period', 'meeting', 'activity', 'ceremony', 'other']);

export const createAcademicEventSchema = z
  .object({
    academicYearId: z.string().uuid(),
    title: z.string().min(1).max(255),
    description: z.string().max(2000).optional(),
    eventType: eventTypeEnum,
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    isSchoolClosed: z.boolean().default(false),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: 'endDate must be on or after startDate',
    path: ['endDate'],
  });

export const updateAcademicEventSchema = z
  .object({
    academicYearId: z.string().uuid().optional(),
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).nullable().optional(),
    eventType: eventTypeEnum.optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    isSchoolClosed: z.boolean().optional(),
  })
  .refine(
    (d) => {
      if (d.startDate && d.endDate) return d.endDate >= d.startDate;
      return true;
    },
    { message: 'endDate must be on or after startDate', path: ['endDate'] },
  );

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listAcademicEventsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'startDate', 'title']).default('startDate'),
  order: z.enum(['asc', 'desc']).default('asc'),
  academicYearId: z.string().uuid().optional(),
  eventType: eventTypeEnum.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type CreateAcademicEventInput = z.infer<typeof createAcademicEventSchema>;
export type UpdateAcademicEventInput = z.infer<typeof updateAcademicEventSchema>;
export type ListAcademicEventsQuery = z.infer<typeof listAcademicEventsQuerySchema>;
