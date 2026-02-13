import type { Request, Response } from 'express';
import type { StudentGuardianService } from './student-guardian.service.ts';
import { createStudentGuardianSchema, updateStudentGuardianSchema, studentIdParamSchema, idParamSchema } from './student-guardian.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class StudentGuardianController {
  private readonly service: StudentGuardianService;
  constructor(service: StudentGuardianService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const { studentId } = studentIdParamSchema.parse(req.params);
    const data = await this.service.listByStudent(studentId);
    res.json({ success: true, data });
  };

  create = async (req: Request, res: Response) => {
    const { studentId } = studentIdParamSchema.parse(req.params);
    const input = createStudentGuardianSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const link = await this.service.create(schoolId, studentId, input);
    res.status(201).json({ success: true, data: link });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateStudentGuardianSchema.parse(req.body);
    const link = await this.service.update(id, input);
    res.json({ success: true, data: link });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };
}
