import type { Request, Response } from 'express';
import type { RoomService } from './room.service.ts';
import { createRoomSchema, updateRoomSchema, listRoomsQuerySchema, idParamSchema, roomIdParamSchema, assignSubjectsSchema } from './room.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class RoomController {
  private readonly service: RoomService;
  constructor(service: RoomService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listRoomsQuerySchema.parse(req.query);
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
    const room = await this.service.getById(id);
    res.json({ success: true, data: room });
  };

  create = async (req: Request, res: Response) => {
    const input = createRoomSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const room = await this.service.create(schoolId, input);
    res.status(201).json({ success: true, data: room });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateRoomSchema.parse(req.body);
    const room = await this.service.update(id, input);
    res.json({ success: true, data: room });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };

  assignSubjects = async (req: Request, res: Response) => {
    const { roomId } = roomIdParamSchema.parse(req.params);
    const input = assignSubjectsSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const data = await this.service.assignSubjects(schoolId, roomId, input);
    res.json({ success: true, data });
  };

  getSubjects = async (req: Request, res: Response) => {
    const { roomId } = roomIdParamSchema.parse(req.params);
    const data = await this.service.getSubjects(roomId);
    res.json({ success: true, data });
  };
}
