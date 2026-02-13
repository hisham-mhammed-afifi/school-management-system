import type { Request, Response } from 'express';
import type { SubstitutionService } from './substitution.service.ts';
import { createSubstitutionSchema, updateSubstitutionSchema, listSubstitutionsQuerySchema, idParamSchema } from './substitution.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class SubstitutionController {
  private readonly service: SubstitutionService;
  constructor(service: SubstitutionService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listSubstitutionsQuerySchema.parse(req.query);
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
    const sub = await this.service.getById(id);
    res.json({ success: true, data: sub });
  };

  create = async (req: Request, res: Response) => {
    const input = createSubstitutionSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const sub = await this.service.create(schoolId, input);
    res.status(201).json({ success: true, data: sub });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateSubstitutionSchema.parse(req.body);
    const sub = await this.service.update(id, input);
    res.json({ success: true, data: sub });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };
}
