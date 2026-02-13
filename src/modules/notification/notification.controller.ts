import type { Request, Response } from 'express';
import type { NotificationService } from './notification.service.ts';
import {
  listNotificationsQuerySchema,
  idParamSchema,
  sendNotificationSchema,
} from './notification.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';
import type { JwtPayload } from '../../shared/types/index.ts';

export class NotificationController {
  private readonly service: NotificationService;
  constructor(service: NotificationService) {
    this.service = service;
  }

  private getUser(req: Request): JwtPayload {
    return (req as unknown as Record<string, unknown>)['user'] as JwtPayload;
  }

  list = async (req: Request, res: Response) => {
    const query = listNotificationsQuerySchema.parse(req.query);
    const user = this.getUser(req);
    const result = await this.service.listOwn(user.sub, query);
    res.json({
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  };

  unreadCount = async (req: Request, res: Response) => {
    const user = this.getUser(req);
    const result = await this.service.getUnreadCount(user.sub);
    res.json({ success: true, data: result });
  };

  markRead = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const user = this.getUser(req);
    const notification = await this.service.markRead(id, user.sub);
    res.json({ success: true, data: notification });
  };

  markAllRead = async (req: Request, res: Response) => {
    const user = this.getUser(req);
    const result = await this.service.markAllRead(user.sub);
    res.json({ success: true, data: result });
  };

  send = async (req: Request, res: Response) => {
    const input = sendNotificationSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const result = await this.service.send(schoolId, input);
    res.status(201).json({ success: true, data: result });
  };
}
