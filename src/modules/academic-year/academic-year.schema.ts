import { z } from 'zod';

export const createAcademicYearSchema = z
  .object({
    name: z.string().min(1).max(50),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((d) => d.endDate > d.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export const updateAcademicYearSchema = z
  .object({
    name: z.string().min(1).max(50).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    (d) => {
      if (d.startDate && d.endDate) return d.endDate > d.startDate;
      return true;
    },
    { message: 'End date must be after start date', path: ['endDate'] },
  );

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const listAcademicYearsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

export type CreateAcademicYearInput = z.infer<typeof createAcademicYearSchema>;
export type UpdateAcademicYearInput = z.infer<typeof updateAcademicYearSchema>;
export type ListAcademicYearsQuery = z.infer<typeof listAcademicYearsQuerySchema>;
