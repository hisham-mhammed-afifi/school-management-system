import type { Request, Response } from 'express';
import type { StudentService } from './student.service.ts';
import { createStudentSchema, updateStudentSchema, listStudentsQuerySchema, idParamSchema } from './student.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class StudentController {
  private readonly service: StudentService;
  constructor(service: StudentService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listStudentsQuerySchema.parse(req.query);
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
    const student = await this.service.getById(id);
    res.json({ success: true, data: student });
  };

  create = async (req: Request, res: Response) => {
    const input = createStudentSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const student = await this.service.create(schoolId, input);
    res.status(201).json({ success: true, data: student });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateStudentSchema.parse(req.body);
    const student = await this.service.update(id, input);
    res.json({ success: true, data: student });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };
}
