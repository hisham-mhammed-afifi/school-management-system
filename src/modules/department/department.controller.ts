import type { Request, Response } from 'express';
import type { DepartmentService } from './department.service.ts';
import { createDepartmentSchema, updateDepartmentSchema, listDepartmentsQuerySchema, idParamSchema } from './department.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class DepartmentController {
  private readonly service: DepartmentService;
  constructor(service: DepartmentService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listDepartmentsQuerySchema.parse(req.query);
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
    const dept = await this.service.getById(id);
    res.json({ success: true, data: dept });
  };

  create = async (req: Request, res: Response) => {
    const input = createDepartmentSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const dept = await this.service.create(schoolId, input);
    res.status(201).json({ success: true, data: dept });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateDepartmentSchema.parse(req.body);
    const dept = await this.service.update(id, input);
    res.json({ success: true, data: dept });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };
}
