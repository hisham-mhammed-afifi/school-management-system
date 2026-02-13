import { z } from 'zod';

export const notificationChannelEnum = z.enum(['in_app', 'sms', 'email', 'push']);

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  isRead: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  channel: notificationChannelEnum.optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const sendNotificationSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1),
  title: z.string().min(1).max(255),
  body: z.string().min(1),
  channels: z.array(notificationChannelEnum).min(1),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
