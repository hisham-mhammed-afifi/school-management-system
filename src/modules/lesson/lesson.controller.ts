import type { Request, Response } from 'express';
import type { LessonService } from './lesson.service.ts';
import {
  createLessonSchema, updateLessonSchema, listLessonsQuerySchema, idParamSchema,
  bulkCreateLessonsSchema, autoGenerateSchema, clearLessonsQuerySchema,
} from './lesson.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';
import { AppError } from '../../shared/errors/app-error.ts';
import { z } from 'zod';

const timetableParamsSchema = z.object({
  classSectionId: z.string().uuid().optional(),
  teacherId: z.string().uuid().optional(),
  roomId: z.string().uuid().optional(),
});

const timetableQuerySchema = z.object({
  termId: z.string().uuid(),
});

export class LessonController {
  private readonly service: LessonService;
  constructor(service: LessonService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listLessonsQuerySchema.parse(req.query);
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
    const lesson = await this.service.getById(id);
    res.json({ success: true, data: lesson });
  };

  create = async (req: Request, res: Response) => {
    const input = createLessonSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const lesson = await this.service.create(schoolId, input);
    res.status(201).json({ success: true, data: lesson });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateLessonSchema.parse(req.body);
    const lesson = await this.service.update(id, input);
    res.json({ success: true, data: lesson });
  };

  cancel = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.cancel(id);
    res.status(204).send();
  };

  bulkCreate = async (req: Request, res: Response) => {
    const { lessons } = bulkCreateLessonsSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const result = await this.service.bulkCreate(schoolId, lessons);
    res.status(201).json({ success: true, data: result });
  };

  autoGenerate = async (req: Request, res: Response) => {
    const input = autoGenerateSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const result = await this.service.autoGenerate(schoolId, input);
    res.json({ success: true, data: result });
  };

  clear = async (req: Request, res: Response) => {
    const { termId } = clearLessonsQuerySchema.parse(req.query);
    const schoolId = extractSchoolId(req);
    const result = await this.service.clearByTerm(schoolId, termId);
    res.json({ success: true, data: result });
  };

  // ---- Timetable views ----

  timetableByClass = async (req: Request, res: Response) => {
    const { classSectionId } = timetableParamsSchema.parse(req.params);
    const { termId } = timetableQuerySchema.parse(req.query);
    const schoolId = extractSchoolId(req);
    if (!classSectionId) {
      throw new AppError('Class section ID is required', 400, 'MISSING_CLASS_SECTION');
    }
    const result = await this.service.getTimetableByClass(schoolId, termId, classSectionId);
    res.json({ success: true, data: result });
  };

  timetableByTeacher = async (req: Request, res: Response) => {
    const { teacherId } = timetableParamsSchema.parse(req.params);
    const { termId } = timetableQuerySchema.parse(req.query);
    const schoolId = extractSchoolId(req);
    if (!teacherId) {
      throw new AppError('Teacher ID is required', 400, 'MISSING_TEACHER');
    }
    const result = await this.service.getTimetableByTeacher(schoolId, termId, teacherId);
    res.json({ success: true, data: result });
  };

  timetableByRoom = async (req: Request, res: Response) => {
    const { roomId } = timetableParamsSchema.parse(req.params);
    const { termId } = timetableQuerySchema.parse(req.query);
    const schoolId = extractSchoolId(req);
    if (!roomId) {
      throw new AppError('Room ID is required', 400, 'MISSING_ROOM');
    }
    const result = await this.service.getTimetableByRoom(schoolId, termId, roomId);
    res.json({ success: true, data: result });
  };
}
