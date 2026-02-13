import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListTeacherAttendanceQuery } from './teacher-attendance.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class TeacherAttendanceRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  private readonly includeRelations = {
    teacher: true,
  } as const;

  async findMany(schoolId: string, query: ListTeacherAttendanceQuery) {
    const { page, limit, sortBy, order, teacherId, date, status } = query;
    const where: Prisma.TeacherAttendanceWhereInput = { schoolId };

    if (teacherId) where.teacherId = teacherId;
    if (date) where.date = date;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.db.teacherAttendance.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
        include: this.includeRelations,
      }),
      this.db.teacherAttendance.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.teacherAttendance.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  async create(data: Prisma.TeacherAttendanceCreateInput) {
    return this.db.teacherAttendance.create({
      data,
      include: this.includeRelations,
    });
  }

  async update(id: string, data: Prisma.TeacherAttendanceUpdateInput) {
    return this.db.teacherAttendance.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  async findByTeacherAndDate(schoolId: string, teacherId: string, date: Date) {
    return this.db.teacherAttendance.findUnique({
      where: {
        schoolId_teacherId_date: { schoolId, teacherId, date },
      },
      include: this.includeRelations,
    });
  }
}
