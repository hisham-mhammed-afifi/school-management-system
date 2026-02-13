import type { Request, Response } from 'express';
import type { ReportCardService } from './report-card.service.ts';
import {
  generateReportCardsSchema,
  updateRemarksSchema,
  listReportCardsQuerySchema,
  idParamSchema,
} from './report-card.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';
import type { JwtPayload } from '../../shared/types/index.ts';

export class ReportCardController {
  private readonly service: ReportCardService;
  constructor(service: ReportCardService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listReportCardsQuerySchema.parse(req.query);
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
    const card = await this.service.getById(id);
    res.json({ success: true, data: card });
  };

  generate = async (req: Request, res: Response) => {
    const input = generateReportCardsSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const user = (req as unknown as Record<string, unknown>)['user'] as JwtPayload;
    const result = await this.service.generate(schoolId, user.sub, input);
    res.status(201).json({ success: true, data: result });
  };

  updateRemarks = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateRemarksSchema.parse(req.body);
    const card = await this.service.updateRemarks(id, input);
    res.json({ success: true, data: card });
  };
}
