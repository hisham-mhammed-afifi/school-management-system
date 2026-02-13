import type { Request, Response } from 'express';
import type { TeacherAttendanceService } from './teacher-attendance.service.ts';
import {
  recordTeacherAttendanceSchema,
  correctTeacherAttendanceSchema,
  listTeacherAttendanceQuerySchema,
  idParamSchema,
} from './teacher-attendance.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class TeacherAttendanceController {
  private readonly service: TeacherAttendanceService;
  constructor(service: TeacherAttendanceService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listTeacherAttendanceQuerySchema.parse(req.query);
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
    const record = await this.service.getById(id);
    res.json({ success: true, data: record });
  };

  record = async (req: Request, res: Response) => {
    const input = recordTeacherAttendanceSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const attendance = await this.service.record(schoolId, input);
    res.status(201).json({ success: true, data: attendance });
  };

  correct = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = correctTeacherAttendanceSchema.parse(req.body);
    const record = await this.service.correct(id, input);
    res.json({ success: true, data: record });
  };
}
