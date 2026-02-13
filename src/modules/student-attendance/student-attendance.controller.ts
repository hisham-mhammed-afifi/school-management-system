import type { Request, Response } from 'express';
import type { StudentAttendanceService } from './student-attendance.service.ts';
import {
  bulkStudentAttendanceSchema,
  correctStudentAttendanceSchema,
  listStudentAttendanceQuerySchema,
  attendanceSummaryQuerySchema,
  idParamSchema,
} from './student-attendance.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';
import type { JwtPayload } from '../../shared/types/index.ts';

export class StudentAttendanceController {
  private readonly service: StudentAttendanceService;
  constructor(service: StudentAttendanceService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listStudentAttendanceQuerySchema.parse(req.query);
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

  bulkRecord = async (req: Request, res: Response) => {
    const input = bulkStudentAttendanceSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const user = (req as unknown as Record<string, unknown>)['user'] as JwtPayload;
    const records = await this.service.bulkRecord(schoolId, user.sub, input);
    res.status(201).json({ success: true, data: records });
  };

  correct = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = correctStudentAttendanceSchema.parse(req.body);
    const record = await this.service.correct(id, input);
    res.json({ success: true, data: record });
  };

  summary = async (req: Request, res: Response) => {
    const query = attendanceSummaryQuerySchema.parse(req.query);
    const schoolId = extractSchoolId(req);
    const data = await this.service.getSummary(schoolId, query);
    res.json({ success: true, data });
  };
}
