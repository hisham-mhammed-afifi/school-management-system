import type { Request, Response } from 'express';
import type { SchoolService } from './school.service.ts';
import {
  createSchoolSchema,
  updateSchoolSchema,
  updateSchoolProfileSchema,
  listSchoolsQuerySchema,
  idParamSchema,
} from './school.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class SchoolController {
  private readonly schoolService: SchoolService;
  constructor(schoolService: SchoolService) {
    this.schoolService = schoolService;
  }

  // ---- Platform (super admin) ----

  list = async (req: Request, res: Response) => {
    const query = listSchoolsQuerySchema.parse(req.query);
    const result = await this.schoolService.list(query);
    res.json({
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  };

  getById = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const school = await this.schoolService.getById(id);
    res.json({ success: true, data: school });
  };

  create = async (req: Request, res: Response) => {
    const input = createSchoolSchema.parse(req.body);
    const school = await this.schoolService.create(input);
    res.status(201).json({ success: true, data: school });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateSchoolSchema.parse(req.body);
    const school = await this.schoolService.update(id, input);
    res.json({ success: true, data: school });
  };

  suspend = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const school = await this.schoolService.suspend(id);
    res.json({ success: true, data: school });
  };

  reactivate = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const school = await this.schoolService.reactivate(id);
    res.json({ success: true, data: school });
  };

  // ---- School profile (school admin) ----

  getProfile = async (req: Request, res: Response) => {
    const schoolId = extractSchoolId(req);
    const school = await this.schoolService.getProfile(schoolId);
    res.json({ success: true, data: school });
  };

  updateProfile = async (req: Request, res: Response) => {
    const schoolId = extractSchoolId(req);
    const input = updateSchoolProfileSchema.parse(req.body);
    const school = await this.schoolService.updateProfile(schoolId, input);
    res.json({ success: true, data: school });
  };
}
