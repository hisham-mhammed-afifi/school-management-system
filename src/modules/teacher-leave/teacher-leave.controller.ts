import type { Request, Response } from 'express';
import type { TeacherLeaveService } from './teacher-leave.service.ts';
import { createTeacherLeaveSchema, listTeacherLeavesQuerySchema, idParamSchema } from './teacher-leave.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';
import type { JwtPayload } from '../../shared/types/index.ts';

export class TeacherLeaveController {
  private readonly service: TeacherLeaveService;
  constructor(service: TeacherLeaveService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listTeacherLeavesQuerySchema.parse(req.query);
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
    const leave = await this.service.getById(id);
    res.json({ success: true, data: leave });
  };

  create = async (req: Request, res: Response) => {
    const input = createTeacherLeaveSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const leave = await this.service.create(schoolId, input);
    res.status(201).json({ success: true, data: leave });
  };

  approve = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const user = (req as unknown as Record<string, unknown>)['user'] as JwtPayload;
    const leave = await this.service.approve(id, user.sub);
    res.json({ success: true, data: leave });
  };

  reject = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const user = (req as unknown as Record<string, unknown>)['user'] as JwtPayload;
    const leave = await this.service.reject(id, user.sub);
    res.json({ success: true, data: leave });
  };

  cancel = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const leave = await this.service.cancel(id);
    res.json({ success: true, data: leave });
  };
}
