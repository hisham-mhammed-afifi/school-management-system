import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';

export class ExamSubjectRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  private readonly includeRelations = {
    subject: true,
    grade: true,
  } as const;

  async findByExam(examId: string) {
    return this.db.examSubject.findMany({
      where: { examId },
      include: this.includeRelations,
      orderBy: { subject: { name: 'asc' } },
    });
  }

  async findById(id: string) {
    return this.db.examSubject.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  async create(data: Prisma.ExamSubjectCreateInput) {
    return this.db.examSubject.create({
      data,
      include: this.includeRelations,
    });
  }

  async update(id: string, data: Prisma.ExamSubjectUpdateInput) {
    return this.db.examSubject.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  async delete(id: string) {
    return this.db.examSubject.delete({ where: { id } });
  }

  async hasGrades(id: string): Promise<boolean> {
    const count = await this.db.studentGrade.count({ where: { examSubjectId: id } });
    return count > 0;
  }
}
