import type { Request, Response } from 'express';
import type { FeeCategoryService } from './fee-category.service.ts';
import { createFeeCategorySchema, updateFeeCategorySchema, listFeeCategoriesQuerySchema, idParamSchema } from './fee-category.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class FeeCategoryController {
  private readonly service: FeeCategoryService;
  constructor(service: FeeCategoryService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listFeeCategoriesQuerySchema.parse(req.query);
    const schoolId = extractSchoolId(req);
    const result = await this.service.list(schoolId, query);
    res.json({
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  };

  create = async (req: Request, res: Response) => {
    const input = createFeeCategorySchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const category = await this.service.create(schoolId, input);
    res.status(201).json({ success: true, data: category });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateFeeCategorySchema.parse(req.body);
    const category = await this.service.update(id, input);
    res.json({ success: true, data: category });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };
}
