import type { Request, Response } from 'express';
import type { ClassSectionService } from './class-section.service.ts';
import { createClassSectionSchema, updateClassSectionSchema, listClassSectionsQuerySchema, idParamSchema } from './class-section.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class ClassSectionController {
  private readonly service: ClassSectionService;
  constructor(service: ClassSectionService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listClassSectionsQuerySchema.parse(req.query);
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
    const section = await this.service.getById(id);
    res.json({ success: true, data: section });
  };

  create = async (req: Request, res: Response) => {
    const input = createClassSectionSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const section = await this.service.create(schoolId, input);
    res.status(201).json({ success: true, data: section });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateClassSectionSchema.parse(req.body);
    const section = await this.service.update(id, input);
    res.json({ success: true, data: section });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };
}
