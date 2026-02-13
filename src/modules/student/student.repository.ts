import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListStudentsQuery } from './student.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

const NOT_DELETED: Prisma.StudentWhereInput = { deletedAt: null };

export class StudentRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findMany(schoolId: string, query: ListStudentsQuery) {
    const { page, limit, search, sortBy, order, status, gradeId, classSectionId } = query;
    const where: Prisma.StudentWhereInput = { schoolId, ...NOT_DELETED };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { studentCode: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (gradeId || classSectionId) {
      where.studentEnrollments = {
        some: {
          status: 'active',
          ...(gradeId ? { classSection: { gradeId } } : {}),
          ...(classSectionId ? { classSectionId } : {}),
        },
      };
    }

    const [data, total] = await Promise.all([
      this.db.student.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      this.db.student.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.student.findFirst({
      where: { id, ...NOT_DELETED },
    });
  }

  async create(data: Prisma.StudentCreateInput) {
    return this.db.student.create({ data });
  }

  async update(id: string, data: Prisma.StudentUpdateInput) {
    return this.db.student.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return this.db.student.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
