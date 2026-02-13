import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListRoomsQuery } from './room.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class RoomRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findMany(schoolId: string, query: ListRoomsQuery) {
    const { page, limit, sortBy, order, roomType, building } = query;
    const where: Prisma.RoomWhereInput = { schoolId };

    if (roomType) where.roomType = roomType;
    if (building) where.building = { contains: building, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.db.room.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      this.db.room.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.room.findUnique({
      where: { id },
      include: { roomSubjectSuitability: { include: { subject: true } } },
    });
  }

  async create(data: Prisma.RoomCreateInput) {
    return this.db.room.create({ data });
  }

  async update(id: string, data: Prisma.RoomUpdateInput) {
    return this.db.room.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.db.room.delete({ where: { id } });
  }

  async replaceSubjects(schoolId: string, roomId: string, subjectIds: string[]) {
    return this.db.$transaction(async (tx) => {
      await tx.roomSubjectSuitability.deleteMany({ where: { schoolId, roomId } });

      if (subjectIds.length > 0) {
        await Promise.all(
          subjectIds.map((subjectId) =>
            tx.roomSubjectSuitability.create({
              data: {
                school: { connect: { id: schoolId } },
                room: { connect: { id: roomId } },
                subject: { connect: { id: subjectId } },
              },
            }),
          ),
        );
      }

      return tx.roomSubjectSuitability.findMany({
        where: { schoolId, roomId },
        include: { subject: true },
      });
    });
  }

  async findSubjects(roomId: string) {
    return this.db.roomSubjectSuitability.findMany({
      where: { roomId },
      include: { subject: true },
    });
  }
}
