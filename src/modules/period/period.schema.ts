import { z } from 'zod';

export const setIdParamSchema = z.object({
  setId: z.string().uuid('Invalid period set ID format'),
});

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const periodEntry = z.object({
  name: z.string().min(1).max(50),
  startTime: z.string().regex(TIME_REGEX, 'Must be HH:MM format (24-hour)'),
  endTime: z.string().regex(TIME_REGEX, 'Must be HH:MM format (24-hour)'),
  orderIndex: z.number().int().positive(),
  isBreak: z.boolean().default(false),
});

export const replacePeriodsSchema = z.object({
  periods: z.array(periodEntry).min(1).refine(
    (periods) => {
      // Each period: endTime > startTime
      return periods.every((p) => p.endTime > p.startTime);
    },
    { message: 'Each period endTime must be after startTime' },
  ).refine(
    (periods) => {
      // orderIndex must be unique
      const indexes = periods.map((p) => p.orderIndex);
      return new Set(indexes).size === indexes.length;
    },
    { message: 'orderIndex values must be unique' },
  ).refine(
    (periods) => {
      // At least one non-break period
      return periods.some((p) => !p.isBreak);
    },
    { message: 'At least one non-break period is required' },
  ),
});

/** Convert HH:MM to a Date with time component for Prisma @db.Time() */
export function timeStringToDate(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const d = new Date(1970, 0, 1, hours, minutes, 0, 0);
  return d;
}

export type ReplacePeriodsInput = z.infer<typeof replacePeriodsSchema>;
