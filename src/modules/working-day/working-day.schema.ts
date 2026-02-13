import { z } from 'zod';

export const setIdParamSchema = z.object({
  setId: z.string().uuid('Invalid period set ID format'),
});

const workingDayEntry = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isActive: z.boolean(),
});

export const replaceWorkingDaysSchema = z.object({
  workingDays: z.array(workingDayEntry).min(1).max(7).refine(
    (days) => {
      const daySet = new Set(days.map((d) => d.dayOfWeek));
      return daySet.size === days.length;
    },
    { message: 'Duplicate dayOfWeek values are not allowed' },
  ).refine(
    (days) => days.some((d) => d.isActive),
    { message: 'At least one working day must be active' },
  ),
});

export type ReplaceWorkingDaysInput = z.infer<typeof replaceWorkingDaysSchema>;
