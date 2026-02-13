import type { Request, Response } from 'express';
import type { TeacherService } from './teacher.service.ts';
import { createTeacherSchema, updateTeacherSchema, listTeachersQuerySchema, idParamSchema, assignSubjectsSchema } from './teacher.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class TeacherController {
  private readonly service: TeacherService;
  constructor(service: TeacherService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listTeachersQuerySchema.parse(req.query);
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
    const teacher = await this.service.getById(id);
    res.json({ success: true, data: teacher });
  };

  create = async (req: Request, res: Response) => {
    const input = createTeacherSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const teacher = await this.service.create(schoolId, input);
    res.status(201).json({ success: true, data: teacher });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateTeacherSchema.parse(req.body);
    const teacher = await this.service.update(id, input);
    res.json({ success: true, data: teacher });
  };

  assignSubjects = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = assignSubjectsSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const subjects = await this.service.assignSubjects(schoolId, id, input);
    res.json({ success: true, data: subjects });
  };

  getSubjects = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const subjects = await this.service.getSubjects(id);
    res.json({ success: true, data: subjects });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };
}
