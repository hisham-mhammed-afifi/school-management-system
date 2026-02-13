import type { Request, Response } from 'express';
import type { AcademicYearService } from './academic-year.service.ts';
import { createAcademicYearSchema, updateAcademicYearSchema, listAcademicYearsQuerySchema, idParamSchema } from './academic-year.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class AcademicYearController {
  private readonly service: AcademicYearService;
  constructor(service: AcademicYearService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listAcademicYearsQuerySchema.parse(req.query);
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
    const year = await this.service.getById(id);
    res.json({ success: true, data: year });
  };

  create = async (req: Request, res: Response) => {
    const input = createAcademicYearSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const year = await this.service.create(schoolId, input);
    res.status(201).json({ success: true, data: year });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateAcademicYearSchema.parse(req.body);
    const year = await this.service.update(id, input);
    res.json({ success: true, data: year });
  };

  activate = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const year = await this.service.activate(id);
    res.json({ success: true, data: year });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };
}
