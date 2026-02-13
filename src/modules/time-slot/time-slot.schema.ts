import { z } from 'zod';

export const setIdParamSchema = z.object({
  setId: z.string().uuid('Invalid period set ID format'),
});

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export function getDayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek] ?? `Day ${dayOfWeek}`;
}
