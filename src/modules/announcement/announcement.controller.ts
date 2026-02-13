import type { Request, Response } from 'express';
import type { AnnouncementService } from './announcement.service.ts';
import {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  listAnnouncementsQuerySchema,
  idParamSchema,
} from './announcement.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';
import type { JwtPayload } from '../../shared/types/index.ts';

export class AnnouncementController {
  private readonly service: AnnouncementService;
  constructor(service: AnnouncementService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listAnnouncementsQuerySchema.parse(req.query);
    const schoolId = extractSchoolId(req);
    const result = await this.service.list(schoolId, query);
    res.json({
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  };

  getById = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const announcement = await this.service.getById(id);
    res.json({ success: true, data: announcement });
  };

  create = async (req: Request, res: Response) => {
    const input = createAnnouncementSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const user = (req as unknown as Record<string, unknown>)['user'] as JwtPayload;
    const announcement = await this.service.create(schoolId, user.sub, input);
    res.status(201).json({ success: true, data: announcement });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateAnnouncementSchema.parse(req.body);
    const announcement = await this.service.update(id, input);
    res.json({ success: true, data: announcement });
  };

  publish = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const announcement = await this.service.publish(id);
    res.json({ success: true, data: announcement });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };
}
