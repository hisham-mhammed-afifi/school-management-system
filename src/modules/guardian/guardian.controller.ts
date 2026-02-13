import type { Request, Response } from 'express';
import type { GuardianService } from './guardian.service.ts';
import { createGuardianSchema, updateGuardianSchema, listGuardiansQuerySchema, idParamSchema } from './guardian.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class GuardianController {
  private readonly service: GuardianService;
  constructor(service: GuardianService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listGuardiansQuerySchema.parse(req.query);
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
    const guardian = await this.service.getById(id);
    res.json({ success: true, data: guardian });
  };

  create = async (req: Request, res: Response) => {
    const input = createGuardianSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const guardian = await this.service.create(schoolId, input);
    res.status(201).json({ success: true, data: guardian });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateGuardianSchema.parse(req.body);
    const guardian = await this.service.update(id, input);
    res.json({ success: true, data: guardian });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };
}
