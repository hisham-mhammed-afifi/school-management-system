import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListPeriodSetsQuery } from './period-set.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class PeriodSetRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findMany(schoolId: string, query: ListPeriodSetsQuery) {
    const { page, limit, sortBy, order, academicYearId } = query;
    const where: Prisma.PeriodSetWhereInput = { schoolId };

    if (academicYearId) where.academicYearId = academicYearId;

    const [data, total] = await Promise.all([
      this.db.periodSet.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
        include: { academicYear: true },
      }),
      this.db.periodSet.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.periodSet.findUnique({
      where: { id },
      include: {
        academicYear: true,
        periods: { orderBy: { orderIndex: 'asc' } },
        schoolWorkingDays: { orderBy: { dayOfWeek: 'asc' } },
      },
    });
  }

  async create(data: Prisma.PeriodSetCreateInput) {
    return this.db.periodSet.create({
      data,
      include: { academicYear: true },
    });
  }

  async update(id: string, data: Prisma.PeriodSetUpdateInput) {
    return this.db.periodSet.update({
      where: { id },
      data,
      include: { academicYear: true },
    });
  }

  async delete(id: string) {
    return this.db.periodSet.delete({ where: { id } });
  }
}
