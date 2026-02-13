import type { Request, Response } from 'express';
import type { ExamSubjectService } from './exam-subject.service.ts';
import {
  createExamSubjectSchema,
  updateExamSubjectSchema,
  examIdParamSchema,
  examSubjectIdParamSchema,
} from './exam-subject.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class ExamSubjectController {
  private readonly service: ExamSubjectService;
  constructor(service: ExamSubjectService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const { examId } = examIdParamSchema.parse(req.params);
    const data = await this.service.listByExam(examId);
    res.json({ success: true, data });
  };

  create = async (req: Request, res: Response) => {
    const { examId } = examIdParamSchema.parse(req.params);
    const input = createExamSubjectSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const examSubject = await this.service.create(schoolId, examId, input);
    res.status(201).json({ success: true, data: examSubject });
  };

  update = async (req: Request, res: Response) => {
    const { id } = examSubjectIdParamSchema.parse(req.params);
    const input = updateExamSubjectSchema.parse(req.body);
    const examSubject = await this.service.update(id, input);
    res.json({ success: true, data: examSubject });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = examSubjectIdParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };
}
