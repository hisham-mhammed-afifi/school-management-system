import type { Request, Response } from 'express';
import type { EnrollmentService } from './enrollment.service.ts';
import { createEnrollmentSchema, updateEnrollmentSchema, listEnrollmentsQuerySchema, idParamSchema, bulkPromoteSchema } from './enrollment.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class EnrollmentController {
  private readonly service: EnrollmentService;
  constructor(service: EnrollmentService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listEnrollmentsQuerySchema.parse(req.query);
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
    const enrollment = await this.service.getById(id);
    res.json({ success: true, data: enrollment });
  };

  create = async (req: Request, res: Response) => {
    const input = createEnrollmentSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const enrollment = await this.service.create(schoolId, input);
    res.status(201).json({ success: true, data: enrollment });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateEnrollmentSchema.parse(req.body);
    const enrollment = await this.service.update(id, input);
    res.json({ success: true, data: enrollment });
  };

  bulkPromote = async (req: Request, res: Response) => {
    const input = bulkPromoteSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const enrollments = await this.service.bulkPromote(schoolId, input);
    res.status(201).json({ success: true, data: enrollments });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };
}
