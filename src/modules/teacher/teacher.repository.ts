import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListTeachersQuery } from './teacher.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

const NOT_DELETED: Prisma.TeacherWhereInput = { deletedAt: null };

export class TeacherRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findMany(schoolId: string, query: ListTeachersQuery) {
    const { page, limit, search, sortBy, order, status, departmentId } = query;
    const where: Prisma.TeacherWhereInput = { schoolId, ...NOT_DELETED };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { teacherCode: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;

    const [data, total] = await Promise.all([
      this.db.teacher.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
        include: { department: true },
      }),
      this.db.teacher.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.teacher.findFirst({
      where: { id, ...NOT_DELETED },
      include: { department: true, teacherSubjects: { include: { subject: true } } },
    });
  }

  async create(data: Prisma.TeacherCreateInput) {
    return this.db.teacher.create({
      data,
      include: { department: true },
    });
  }

  async update(id: string, data: Prisma.TeacherUpdateInput) {
    return this.db.teacher.update({
      where: { id },
      data,
      include: { department: true },
    });
  }

  async softDelete(id: string) {
    return this.db.teacher.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async replaceSubjects(schoolId: string, teacherId: string, subjectIds: string[]) {
    return this.db.$transaction(async (tx) => {
      await tx.teacherSubject.deleteMany({
        where: { schoolId, teacherId },
      });

      if (subjectIds.length > 0) {
        await Promise.all(
          subjectIds.map((subjectId) =>
            tx.teacherSubject.create({
              data: {
                school: { connect: { id: schoolId } },
                teacher: { connect: { id: teacherId } },
                subject: { connect: { id: subjectId } },
              },
            }),
          ),
        );
      }

      return tx.teacherSubject.findMany({
        where: { schoolId, teacherId },
        include: { subject: true },
      });
    });
  }

  async findSubjects(teacherId: string) {
    return this.db.teacherSubject.findMany({
      where: { teacherId },
      include: { subject: true },
    });
  }
}
