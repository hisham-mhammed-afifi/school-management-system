import type { Request, Response } from 'express';
import type { PeriodService } from './period.service.ts';
import { setIdParamSchema, replacePeriodsSchema } from './period.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class PeriodController {
  private readonly service: PeriodService;
  constructor(service: PeriodService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const { setId } = setIdParamSchema.parse(req.params);
    const data = await this.service.listByPeriodSet(setId);
    res.json({ success: true, data });
  };

  replace = async (req: Request, res: Response) => {
    const { setId } = setIdParamSchema.parse(req.params);
    const input = replacePeriodsSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const data = await this.service.replace(schoolId, setId, input);
    res.json({ success: true, data });
  };
}
