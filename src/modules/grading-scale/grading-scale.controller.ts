import type { Request, Response } from 'express';
import type { GradingScaleService } from './grading-scale.service.ts';
import {
  createGradingScaleSchema,
  updateGradingScaleSchema,
  listGradingScalesQuerySchema,
  idParamSchema,
} from './grading-scale.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class GradingScaleController {
  private readonly service: GradingScaleService;
  constructor(service: GradingScaleService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listGradingScalesQuerySchema.parse(req.query);
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
    const scale = await this.service.getById(id);
    res.json({ success: true, data: scale });
  };

  create = async (req: Request, res: Response) => {
    const input = createGradingScaleSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const scale = await this.service.create(schoolId, input);
    res.status(201).json({ success: true, data: scale });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateGradingScaleSchema.parse(req.body);
    const scale = await this.service.update(id, input);
    res.json({ success: true, data: scale });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };
}
