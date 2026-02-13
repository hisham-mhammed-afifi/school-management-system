import type { RoomRepository } from './room.repository.ts';
import type { CreateRoomInput, UpdateRoomInput, ListRoomsQuery, AssignSubjectsInput } from './room.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class RoomService {
  private readonly repo: RoomRepository;
  constructor(repo: RoomRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListRoomsQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const room = await this.repo.findById(id);
    if (!room) throw new AppError('Room not found', 404, 'ROOM_NOT_FOUND');
    return room;
  }

  async create(schoolId: string, input: CreateRoomInput) {
    return this.repo.create({
      school: { connect: { id: schoolId } },
      ...input,
    });
  }

  async update(id: string, input: UpdateRoomInput) {
    await this.getById(id);
    return this.repo.update(id, input);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repo.delete(id);
  }

  async assignSubjects(schoolId: string, roomId: string, input: AssignSubjectsInput) {
    await this.getById(roomId);
    return this.repo.replaceSubjects(schoolId, roomId, input.subjectIds);
  }

  async getSubjects(roomId: string) {
    await this.getById(roomId);
    return this.repo.findSubjects(roomId);
  }
}
