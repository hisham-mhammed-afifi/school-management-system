import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().min(1).max(50),
  building: z.string().max(50).optional(),
  floor: z.string().max(20).optional(),
  capacity: z.number().int().positive(),
  roomType: z.enum(['classroom', 'lab', 'hall', 'library', 'gym', 'office']),
});

export const updateRoomSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  building: z.string().max(50).nullable().optional(),
  floor: z.string().max(20).nullable().optional(),
  capacity: z.number().int().positive().optional(),
  roomType: z.enum(['classroom', 'lab', 'hall', 'library', 'gym', 'office']).optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const roomIdParamSchema = z.object({
  roomId: z.string().uuid('Invalid room ID format'),
});

export const listRoomsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'name', 'capacity']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
  roomType: z.enum(['classroom', 'lab', 'hall', 'library', 'gym', 'office']).optional(),
  building: z.string().max(50).optional(),
});

export const assignSubjectsSchema = z.object({
  subjectIds: z.array(z.string().uuid()).min(0),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type ListRoomsQuery = z.infer<typeof listRoomsQuerySchema>;
export type AssignSubjectsInput = z.infer<typeof assignSubjectsSchema>;
