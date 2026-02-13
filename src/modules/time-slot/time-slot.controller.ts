import type { Request, Response } from 'express';
import type { TimeSlotService } from './time-slot.service.ts';
import { setIdParamSchema, getDayName } from './time-slot.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class TimeSlotController {
  private readonly service: TimeSlotService;
  constructor(service: TimeSlotService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const { setId } = setIdParamSchema.parse(req.params);
    const schoolId = extractSchoolId(req);
    const data = await this.service.listByPeriodSet(schoolId, setId);
    res.json({ success: true, data });
  };

  generate = async (req: Request, res: Response) => {
    const { setId } = setIdParamSchema.parse(req.params);
    const schoolId = extractSchoolId(req);
    const result = await this.service.generate(schoolId, setId);

    const details = result.details.map((d) => ({
      dayOfWeek: d.dayOfWeek,
      dayName: getDayName(d.dayOfWeek),
      periodId: d.periodId,
      periodName: d.periodName,
      startTime: d.startTime,
      endTime: d.endTime,
      isBreak: d.isBreak,
    }));

    res.status(201).json({
      success: true,
      data: { totalSlotsGenerated: result.totalSlotsGenerated, details },
    });
  };
}
