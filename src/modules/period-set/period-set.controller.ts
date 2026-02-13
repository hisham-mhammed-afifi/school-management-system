import type { Request, Response } from 'express';
import type { PeriodSetService } from './period-set.service.ts';
import { createPeriodSetSchema, updatePeriodSetSchema, listPeriodSetsQuerySchema, idParamSchema } from './period-set.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class PeriodSetController {
  private readonly service: PeriodSetService;
  constructor(service: PeriodSetService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listPeriodSetsQuerySchema.parse(req.query);
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
    const periodSet = await this.service.getById(id);
    res.json({ success: true, data: periodSet });
  };

  create = async (req: Request, res: Response) => {
    const input = createPeriodSetSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const periodSet = await this.service.create(schoolId, input);
    res.status(201).json({ success: true, data: periodSet });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updatePeriodSetSchema.parse(req.body);
    const periodSet = await this.service.update(id, input);
    res.json({ success: true, data: periodSet });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };
}
