import type { NotificationRepository } from './notification.repository.ts';
import type { ListNotificationsQuery, SendNotificationInput } from './notification.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class NotificationService {
  private readonly repo: NotificationRepository;
  constructor(repo: NotificationRepository) {
    this.repo = repo;
  }

  async listOwn(userId: string, query: ListNotificationsQuery) {
    return this.repo.findManyForUser(userId, query);
  }

  async getUnreadCount(userId: string) {
    const count = await this.repo.getUnreadCount(userId);
    return { unreadCount: count };
  }

  async markRead(id: string, userId: string) {
    const notification = await this.repo.findById(id);
    if (!notification) throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
    if (notification.userId !== userId) throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
    if (notification.isRead) return notification;
    return this.repo.markRead(id);
  }

  async markAllRead(userId: string) {
    const result = await this.repo.markAllRead(userId);
    return { markedCount: result.count };
  }

  async send(schoolId: string, input: SendNotificationInput) {
    const notifications: Array<{ userId: string; title: string; body: string; channel: string }> = [];

    for (const userId of input.userIds) {
      for (const channel of input.channels) {
        notifications.push({
          userId,
          title: input.title,
          body: input.body,
          channel,
        });
      }
    }

    const result = await this.repo.createMany(schoolId, notifications);
    return { sentCount: result.count };
  }
}
