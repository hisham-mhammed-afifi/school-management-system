import type { Request, Response } from 'express';
import type { SubjectService } from './subject.service.ts';
import {
  createSubjectSchema,
  updateSubjectSchema,
  setSubjectGradesSchema,
  listSubjectsQuerySchema,
  idParamSchema,
  subjectIdParamSchema,
  gradeIdParamSchema,
} from './subject.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class SubjectController {
  private readonly service: SubjectService;
  constructor(service: SubjectService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listSubjectsQuerySchema.parse(req.query);
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
    const subject = await this.service.getById(id);
    res.json({ success: true, data: subject });
  };

  create = async (req: Request, res: Response) => {
    const input = createSubjectSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const subject = await this.service.create(schoolId, input);
    res.status(201).json({ success: true, data: subject });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateSubjectSchema.parse(req.body);
    const subject = await this.service.update(id, input);
    res.json({ success: true, data: subject });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };

  setGrades = async (req: Request, res: Response) => {
    const { subjectId } = subjectIdParamSchema.parse(req.params);
    const schoolId = extractSchoolId(req);
    const input = setSubjectGradesSchema.parse(req.body);
    const subject = await this.service.setGrades(schoolId, subjectId, input);
    res.json({ success: true, data: subject });
  };

  getByGrade = async (req: Request, res: Response) => {
    const { gradeId } = gradeIdParamSchema.parse(req.params);
    const schoolId = extractSchoolId(req);
    const subjects = await this.service.getByGrade(schoolId, gradeId);
    res.json({ success: true, data: subjects });
  };
}
