import type { Request, Response } from 'express';
import type { StudentGradeService } from './student-grade.service.ts';
import {
  bulkGradeSchema,
  correctGradeSchema,
  listGradesQuerySchema,
  gradeReportQuerySchema,
  idParamSchema,
} from './student-grade.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';
import type { JwtPayload } from '../../shared/types/index.ts';

export class StudentGradeController {
  private readonly service: StudentGradeService;
  constructor(service: StudentGradeService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listGradesQuerySchema.parse(req.query);
    const schoolId = extractSchoolId(req);
    const result = await this.service.list(schoolId, query);
    res.json({
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  };

  bulkRecord = async (req: Request, res: Response) => {
    const input = bulkGradeSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const user = (req as unknown as Record<string, unknown>)['user'] as JwtPayload;
    const grades = await this.service.bulkRecord(schoolId, user.sub, input);
    res.status(201).json({ success: true, data: grades });
  };

  correct = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = correctGradeSchema.parse(req.body);
    const grade = await this.service.correct(id, input);
    res.json({ success: true, data: grade });
  };

  report = async (req: Request, res: Response) => {
    const query = gradeReportQuerySchema.parse(req.query);
    const schoolId = extractSchoolId(req);
    const data = await this.service.getReport(schoolId, query);
    res.json({ success: true, data });
  };
}
