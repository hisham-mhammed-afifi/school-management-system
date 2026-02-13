import type { Request, Response } from 'express';
import type { AuditLogService } from './audit-log.service.ts';
import { listAuditLogsQuerySchema, idParamSchema } from './audit-log.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class AuditLogController {
  private readonly service: AuditLogService;
  constructor(service: AuditLogService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listAuditLogsQuerySchema.parse(req.query);
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
    const log = await this.service.getById(id);
    res.json({ success: true, data: log });
  };
}
