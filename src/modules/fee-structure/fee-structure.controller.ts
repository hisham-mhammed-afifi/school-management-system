import type { Request, Response } from 'express';
import type { FeeStructureService } from './fee-structure.service.ts';
import { createFeeStructureSchema, updateFeeStructureSchema, listFeeStructuresQuerySchema, idParamSchema } from './fee-structure.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class FeeStructureController {
  private readonly service: FeeStructureService;
  constructor(service: FeeStructureService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listFeeStructuresQuerySchema.parse(req.query);
    const schoolId = extractSchoolId(req);
    const result = await this.service.list(schoolId, query);
    res.json({
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  };

  create = async (req: Request, res: Response) => {
    const input = createFeeStructureSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const structure = await this.service.create(schoolId, input);
    res.status(201).json({ success: true, data: structure });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateFeeStructureSchema.parse(req.body);
    const structure = await this.service.update(id, input);
    res.json({ success: true, data: structure });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };
}
