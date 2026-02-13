import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListGradesQuery } from './grade.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class GradeRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findMany(schoolId: string, query: ListGradesQuery) {
    const { page, limit } = query;
    const where: Prisma.GradeWhereInput = { schoolId };

    const [data, total] = await Promise.all([
      this.db.grade.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { levelOrder: 'asc' },
      }),
      this.db.grade.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.grade.findUnique({ where: { id } });
  }

  async create(data: { schoolId: string; name: string; levelOrder: number }) {
    return this.db.grade.create({ data });
  }

  async update(id: string, data: Prisma.GradeUpdateInput) {
    return this.db.grade.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.db.grade.delete({ where: { id } });
  }

  async hasDependents(id: string): Promise<boolean> {
    const [sections, subjectGrades] = await Promise.all([
      this.db.classSection.count({ where: { gradeId: id } }),
      this.db.subjectGrade.count({ where: { gradeId: id } }),
    ]);
    return sections + subjectGrades > 0;
  }
}
