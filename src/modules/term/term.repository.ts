import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';

export class TermRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findByYearId(yearId: string) {
    return this.db.term.findMany({
      where: { academicYearId: yearId },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async findById(id: string) {
    return this.db.term.findUnique({
      where: { id },
      include: { academicYear: true },
    });
  }

  async findOverlapping(academicYearId: string, startDate: Date, endDate: Date, excludeId?: string) {
    const where: Prisma.TermWhereInput = {
      academicYearId,
      startDate: { lt: endDate },
      endDate: { gt: startDate },
    };
    if (excludeId) where.id = { not: excludeId };
    return this.db.term.findFirst({ where });
  }

  async create(data: {
    schoolId: string;
    academicYearId: string;
    name: string;
    startDate: Date;
    endDate: Date;
    orderIndex: number;
  }) {
    return this.db.term.create({ data });
  }

  async update(id: string, data: Prisma.TermUpdateInput) {
    return this.db.term.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.db.term.delete({ where: { id } });
  }
}
