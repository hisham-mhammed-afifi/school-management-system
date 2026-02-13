import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListNotificationsQuery } from './notification.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

type NotificationChannel = 'in_app' | 'sms' | 'email' | 'push';

export class NotificationRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findManyForUser(userId: string, query: ListNotificationsQuery) {
    const { page, limit, isRead, channel } = query;
    const where: Prisma.NotificationWhereInput = { userId };

    if (isRead !== undefined) where.isRead = isRead;
    if (channel) where.channel = channel;

    const [data, total] = await Promise.all([
      this.db.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.notification.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.db.notification.count({ where: { userId, isRead: false } });
  }

  async findById(id: string) {
    return this.db.notification.findUnique({ where: { id } });
  }

  async markRead(id: string) {
    return this.db.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    return this.db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async createMany(
    schoolId: string,
    notifications: Array<{
      userId: string;
      title: string;
      body: string;
      channel: string;
    }>,
  ) {
    return this.db.notification.createMany({
      data: notifications.map((n) => ({
        schoolId,
        userId: n.userId,
        title: n.title,
        body: n.body,
        channel: n.channel as NotificationChannel,
        sentAt: new Date(),
      })),
    });
  }
}
