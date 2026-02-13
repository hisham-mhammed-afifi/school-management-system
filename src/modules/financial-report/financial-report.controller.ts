import type { Request, Response } from 'express';
import type { FinancialReportService } from './financial-report.service.ts';
import {
  outstandingQuerySchema,
  collectionQuerySchema,
  studentBalanceQuerySchema,
  categoryBreakdownQuerySchema,
} from './financial-report.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class FinancialReportController {
  private readonly service: FinancialReportService;
  constructor(service: FinancialReportService) {
    this.service = service;
  }

  outstanding = async (req: Request, res: Response) => {
    const query = outstandingQuerySchema.parse(req.query);
    const schoolId = extractSchoolId(req);
    const result = await this.service.getOutstanding(schoolId, query);
    res.json({ success: true, data: result });
  };

  collection = async (req: Request, res: Response) => {
    const query = collectionQuerySchema.parse(req.query);
    const schoolId = extractSchoolId(req);
    const result = await this.service.getCollection(schoolId, query);
    res.json({ success: true, data: result });
  };

  studentBalance = async (req: Request, res: Response) => {
    const query = studentBalanceQuerySchema.parse(req.query);
    const schoolId = extractSchoolId(req);
    const result = await this.service.getStudentBalances(schoolId, query);
    res.json({ success: true, data: result.data, meta: result.meta });
  };

  categoryBreakdown = async (req: Request, res: Response) => {
    const query = categoryBreakdownQuerySchema.parse(req.query);
    const schoolId = extractSchoolId(req);
    const result = await this.service.getCategoryBreakdown(schoolId, query);
    res.json({ success: true, data: result });
  };
}
