import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListExamsQuery } from './exam.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class ExamRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  private readonly includeRelations = {
    academicYear: true,
    term: true,
    gradingScale: { include: { levels: { orderBy: { orderIndex: 'asc' as const } } } },
    examSubjects: { include: { subject: true, grade: true } },
  } as const;

  async findMany(schoolId: string, query: ListExamsQuery) {
    const { page, limit, sortBy, order, termId, examType } = query;
    const where: Prisma.ExamWhereInput = { schoolId };

    if (termId) where.termId = termId;
    if (examType) where.examType = examType;

    const [data, total] = await Promise.all([
      this.db.exam.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
        include: this.includeRelations,
      }),
      this.db.exam.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.exam.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  async create(data: Prisma.ExamCreateInput) {
    return this.db.exam.create({
      data,
      include: this.includeRelations,
    });
  }

  async update(id: string, data: Prisma.ExamUpdateInput) {
    return this.db.exam.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  async delete(id: string) {
    return this.db.exam.delete({ where: { id } });
  }

  async hasGrades(id: string): Promise<boolean> {
    const count = await this.db.studentGrade.count({
      where: { examSubject: { examId: id } },
    });
    return count > 0;
  }
}
