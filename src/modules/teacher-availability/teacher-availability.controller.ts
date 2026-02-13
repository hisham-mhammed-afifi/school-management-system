import type { Request, Response } from 'express';
import type { TeacherAvailabilityService } from './teacher-availability.service.ts';
import { teacherIdParamSchema, replaceAvailabilitySchema } from './teacher-availability.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class TeacherAvailabilityController {
  private readonly service: TeacherAvailabilityService;
  constructor(service: TeacherAvailabilityService) {
    this.service = service;
  }

  get = async (req: Request, res: Response) => {
    const { teacherId } = teacherIdParamSchema.parse(req.params);
    const data = await this.service.getByTeacher(teacherId);
    res.json({ success: true, data });
  };

  replace = async (req: Request, res: Response) => {
    const { teacherId } = teacherIdParamSchema.parse(req.params);
    const input = replaceAvailabilitySchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const data = await this.service.replace(schoolId, teacherId, input);
    res.json({ success: true, data });
  };
}
