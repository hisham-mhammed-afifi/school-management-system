import type { Request, Response } from 'express';
import type { WorkingDayService } from './working-day.service.ts';
import { setIdParamSchema, replaceWorkingDaysSchema } from './working-day.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class WorkingDayController {
  private readonly service: WorkingDayService;
  constructor(service: WorkingDayService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const { setId } = setIdParamSchema.parse(req.params);
    const data = await this.service.listByPeriodSet(setId);
    res.json({ success: true, data });
  };

  replace = async (req: Request, res: Response) => {
    const { setId } = setIdParamSchema.parse(req.params);
    const input = replaceWorkingDaysSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const data = await this.service.replace(schoolId, setId, input);
    res.json({ success: true, data });
  };
}
