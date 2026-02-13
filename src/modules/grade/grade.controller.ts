import type { Request, Response } from 'express';
import type { GradeService } from './grade.service.ts';
import { createGradeSchema, updateGradeSchema, listGradesQuerySchema, idParamSchema } from './grade.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class GradeController {
  private readonly service: GradeService;
  constructor(service: GradeService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listGradesQuerySchema.parse(req.query);
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
    const grade = await this.service.getById(id);
    res.json({ success: true, data: grade });
  };

  create = async (req: Request, res: Response) => {
    const input = createGradeSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const grade = await this.service.create(schoolId, input);
    res.status(201).json({ success: true, data: grade });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateGradeSchema.parse(req.body);
    const grade = await this.service.update(id, input);
    res.json({ success: true, data: grade });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };
}
