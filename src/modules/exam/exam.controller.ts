import type { Request, Response } from 'express';
import type { ExamService } from './exam.service.ts';
import { createExamSchema, updateExamSchema, listExamsQuerySchema, idParamSchema } from './exam.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class ExamController {
  private readonly service: ExamService;
  constructor(service: ExamService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listExamsQuerySchema.parse(req.query);
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
    const exam = await this.service.getById(id);
    res.json({ success: true, data: exam });
  };

  create = async (req: Request, res: Response) => {
    const input = createExamSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const exam = await this.service.create(schoolId, input);
    res.status(201).json({ success: true, data: exam });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateExamSchema.parse(req.body);
    const exam = await this.service.update(id, input);
    res.json({ success: true, data: exam });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };
}
