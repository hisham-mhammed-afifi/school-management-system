import { z } from 'zod';

export const teacherIdParamSchema = z.object({
  teacherId: z.string().uuid('Invalid teacher ID format'),
});

const availabilitySlot = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  periodId: z.string().uuid(),
  isAvailable: z.boolean(),
});

export const replaceAvailabilitySchema = z.object({
  slots: z.array(availabilitySlot).min(1),
});

export type ReplaceAvailabilityInput = z.infer<typeof replaceAvailabilitySchema>;
