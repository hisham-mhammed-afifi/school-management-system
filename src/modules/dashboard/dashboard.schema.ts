import { z } from 'zod';

export const attendanceDateQuerySchema = z.object({
  date: z.coerce.date().optional(),
});

export type AttendanceDateQuery = z.infer<typeof attendanceDateQuerySchema>;
