import { z } from 'zod';

export const yearIdParamSchema = z.object({
  yearId: z.string().uuid('Invalid academic year ID'),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const createTermSchema = z
  .object({
    name: z.string().min(1).max(100),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    orderIndex: z.number().int().positive(),
  })
  .refine((d) => d.endDate > d.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export const updateTermSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    orderIndex: z.number().int().positive().optional(),
  })
  .refine(
    (d) => {
      if (d.startDate && d.endDate) return d.endDate > d.startDate;
      return true;
    },
    { message: 'End date must be after start date', path: ['endDate'] },
  );

export type CreateTermInput = z.infer<typeof createTermSchema>;
export type UpdateTermInput = z.infer<typeof updateTermSchema>;
