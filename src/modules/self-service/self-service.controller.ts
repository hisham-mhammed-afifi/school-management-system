import type { Request, Response } from 'express';
import type { SelfServiceService } from './self-service.service.ts';
import {
  paginationQuerySchema,
  timetableQuerySchema,
  attendanceQuerySchema,
  gradesQuerySchema,
  studentIdParamSchema,
  submitLeaveSchema,
} from './self-service.schema.ts';
import type { JwtPayload } from '../../shared/types/index.ts';

export class SelfServiceController {
  private readonly service: SelfServiceService;
  constructor(service: SelfServiceService) {
    this.service = service;
  }

  private getUser(req: Request): JwtPayload {
    return (req as unknown as Record<string, unknown>)['user'] as JwtPayload;
  }

  // ---- Shared ----

  myTimetable = async (req: Request, res: Response) => {
    const query = timetableQuerySchema.parse(req.query);
    const user = this.getUser(req);
    const data = await this.service.getMyTimetable(user.sub, query);
    res.json({ success: true, data });
  };

  // ---- Teacher ----

  myClasses = async (req: Request, res: Response) => {
    const user = this.getUser(req);
    const data = await this.service.getMyClasses(user.sub);
    res.json({ success: true, data });
  };

  myLeaves = async (req: Request, res: Response) => {
    const query = paginationQuerySchema.parse(req.query);
    const user = this.getUser(req);
    const result = await this.service.getMyLeaves(user.sub, query);
    res.json({
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  };

  submitLeave = async (req: Request, res: Response) => {
    const input = submitLeaveSchema.parse(req.body);
    const user = this.getUser(req);
    const leave = await this.service.submitMyLeave(user.sub, input);
    res.status(201).json({ success: true, data: leave });
  };

  mySubstitutions = async (req: Request, res: Response) => {
    const query = paginationQuerySchema.parse(req.query);
    const user = this.getUser(req);
    const result = await this.service.getMySubstitutions(user.sub, query);
    res.json({
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  };

  // ---- Student ----

  myGrades = async (req: Request, res: Response) => {
    const query = gradesQuerySchema.parse(req.query);
    const user = this.getUser(req);
    const result = await this.service.getMyGrades(user.sub, query);
    res.json({
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  };

  myAttendance = async (req: Request, res: Response) => {
    const query = attendanceQuerySchema.parse(req.query);
    const user = this.getUser(req);
    const result = await this.service.getMyAttendance(user.sub, query);
    res.json({
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  };

  myReportCards = async (req: Request, res: Response) => {
    const query = paginationQuerySchema.parse(req.query);
    const user = this.getUser(req);
    const result = await this.service.getMyReportCards(user.sub, query);
    res.json({
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  };

  myInvoices = async (req: Request, res: Response) => {
    const query = paginationQuerySchema.parse(req.query);
    const user = this.getUser(req);
    const result = await this.service.getMyInvoices(user.sub, query);
    res.json({
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  };

  // ---- Guardian ----

  myChildren = async (req: Request, res: Response) => {
    const user = this.getUser(req);
    const data = await this.service.getMyChildren(user.sub);
    res.json({ success: true, data });
  };

  childGrades = async (req: Request, res: Response) => {
    const { studentId } = studentIdParamSchema.parse(req.params);
    const query = gradesQuerySchema.parse(req.query);
    const user = this.getUser(req);
    const result = await this.service.getChildGrades(user.sub, studentId, query);
    res.json({
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  };

  childAttendance = async (req: Request, res: Response) => {
    const { studentId } = studentIdParamSchema.parse(req.params);
    const query = attendanceQuerySchema.parse(req.query);
    const user = this.getUser(req);
    const result = await this.service.getChildAttendance(user.sub, studentId, query);
    res.json({
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  };

  childReportCards = async (req: Request, res: Response) => {
    const { studentId } = studentIdParamSchema.parse(req.params);
    const query = paginationQuerySchema.parse(req.query);
    const user = this.getUser(req);
    const result = await this.service.getChildReportCards(user.sub, studentId, query);
    res.json({
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  };

  childInvoices = async (req: Request, res: Response) => {
    const { studentId } = studentIdParamSchema.parse(req.params);
    const query = paginationQuerySchema.parse(req.query);
    const user = this.getUser(req);
    const result = await this.service.getChildInvoices(user.sub, studentId, query);
    res.json({
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  };
}
