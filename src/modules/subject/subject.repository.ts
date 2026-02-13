import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListSubjectsQuery } from './subject.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class SubjectRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findMany(schoolId: string, query: ListSubjectsQuery) {
    const { page, limit, search, gradeId } = query;
    const where: Prisma.SubjectWhereInput = { schoolId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (gradeId) {
      where.subjectGrades = { some: { gradeId } };
    }

    const [data, total] = await Promise.all([
      this.db.subject.findMany({
        where,
        include: { subjectGrades: { include: { grade: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.db.subject.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.subject.findUnique({
      where: { id },
      include: { subjectGrades: { include: { grade: true } } },
    });
  }

  async create(data: { schoolId: string; name: string; code: string; isLab: boolean; isElective: boolean }) {
    return this.db.subject.create({
      data,
      include: { subjectGrades: { include: { grade: true } } },
    });
  }

  async update(id: string, data: Prisma.SubjectUpdateInput) {
    return this.db.subject.update({
      where: { id },
      data,
      include: { subjectGrades: { include: { grade: true } } },
    });
  }

  async delete(id: string) {
    return this.db.subject.delete({ where: { id } });
  }

  async setGrades(schoolId: string, subjectId: string, gradeIds: string[]) {
    await this.db.subjectGrade.deleteMany({ where: { subjectId } });
    if (gradeIds.length > 0) {
      await this.db.subjectGrade.createMany({
        data: gradeIds.map((gradeId) => ({ schoolId, subjectId, gradeId })),
      });
    }
    return this.findById(subjectId);
  }

  async findByGrade(schoolId: string, gradeId: string) {
    return this.db.subject.findMany({
      where: {
        schoolId,
        subjectGrades: { some: { gradeId } },
      },
      include: { subjectGrades: { include: { grade: true } } },
      orderBy: { name: 'asc' },
    });
  }
}
