import type { Request, Response } from 'express';
import type { DashboardService } from './dashboard.service.ts';
import { attendanceDateQuerySchema } from './dashboard.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class DashboardController {
  private readonly service: DashboardService;
  constructor(service: DashboardService) {
    this.service = service;
  }

  overview = async (req: Request, res: Response) => {
    const schoolId = extractSchoolId(req);
    const data = await this.service.getOverview(schoolId);
    res.json({ success: true, data });
  };

  attendanceToday = async (req: Request, res: Response) => {
    const query = attendanceDateQuerySchema.parse(req.query);
    const schoolId = extractSchoolId(req);
    const data = await this.service.getAttendanceToday(schoolId, query);
    res.json({ success: true, data });
  };

  feesSummary = async (req: Request, res: Response) => {
    const schoolId = extractSchoolId(req);
    const data = await this.service.getFeesSummary(schoolId);
    res.json({ success: true, data });
  };

  recentActivity = async (req: Request, res: Response) => {
    const schoolId = extractSchoolId(req);
    const data = await this.service.getRecentActivity(schoolId);
    res.json({ success: true, data });
  };

  platformDashboard = async (_req: Request, res: Response) => {
    const data = await this.service.getPlatformDashboard();
    res.json({ success: true, data });
  };

  expiringSchools = async (_req: Request, res: Response) => {
    const data = await this.service.getExpiringSchools();
    res.json({ success: true, data });
  };
}
