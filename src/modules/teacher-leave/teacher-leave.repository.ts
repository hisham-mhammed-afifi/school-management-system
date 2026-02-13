import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListTeacherLeavesQuery } from './teacher-leave.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class TeacherLeaveRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  private readonly includeRelations = {
    teacher: true,
    approvedByUser: true,
  } as const;

  async findMany(schoolId: string, query: ListTeacherLeavesQuery) {
    const { page, limit, sortBy, order, teacherId, status } = query;
    const where: Prisma.TeacherLeaveWhereInput = { schoolId };

    if (teacherId) where.teacherId = teacherId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.db.teacherLeave.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
        include: this.includeRelations,
      }),
      this.db.teacherLeave.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.teacherLeave.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  async create(data: Prisma.TeacherLeaveCreateInput) {
    return this.db.teacherLeave.create({
      data,
      include: this.includeRelations,
    });
  }

  async update(id: string, data: Prisma.TeacherLeaveUpdateInput) {
    return this.db.teacherLeave.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  async hasOverlap(schoolId: string, teacherId: string, dateFrom: Date, dateTo: Date, excludeId?: string) {
    const where: Prisma.TeacherLeaveWhereInput = {
      schoolId,
      teacherId,
      status: 'approved',
      dateFrom: { lte: dateTo },
      dateTo: { gte: dateFrom },
    };
    if (excludeId) where.id = { not: excludeId };
    return (await this.db.teacherLeave.count({ where })) > 0;
  }
}
