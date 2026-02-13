import type { Request, Response } from 'express';
import type { AcademicEventService } from './academic-event.service.ts';
import {
  createAcademicEventSchema,
  updateAcademicEventSchema,
  listAcademicEventsQuerySchema,
  idParamSchema,
} from './academic-event.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class AcademicEventController {
  private readonly service: AcademicEventService;
  constructor(service: AcademicEventService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listAcademicEventsQuerySchema.parse(req.query);
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
    const event = await this.service.getById(id);
    res.json({ success: true, data: event });
  };

  create = async (req: Request, res: Response) => {
    const input = createAcademicEventSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const event = await this.service.create(schoolId, input);
    res.status(201).json({ success: true, data: event });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateAcademicEventSchema.parse(req.body);
    const event = await this.service.update(id, input);
    res.json({ success: true, data: event });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };
}
