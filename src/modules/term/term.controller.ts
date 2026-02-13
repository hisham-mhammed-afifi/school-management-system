import type { Request, Response } from 'express';
import type { TermService } from './term.service.ts';
import { createTermSchema, updateTermSchema, yearIdParamSchema, idParamSchema } from './term.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class TermController {
  private readonly service: TermService;
  constructor(service: TermService) {
    this.service = service;
  }

  listByYear = async (req: Request, res: Response) => {
    const { yearId } = yearIdParamSchema.parse(req.params);
    const terms = await this.service.listByYear(yearId);
    res.json({ success: true, data: terms });
  };

  create = async (req: Request, res: Response) => {
    const { yearId } = yearIdParamSchema.parse(req.params);
    const schoolId = extractSchoolId(req);
    const input = createTermSchema.parse(req.body);
    const term = await this.service.create(yearId, schoolId, input);
    res.status(201).json({ success: true, data: term });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateTermSchema.parse(req.body);
    const term = await this.service.update(id, input);
    res.json({ success: true, data: term });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };
}
