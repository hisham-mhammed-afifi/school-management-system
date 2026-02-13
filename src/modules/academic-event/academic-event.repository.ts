import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListAcademicEventsQuery } from './academic-event.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class AcademicEventRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  private readonly includeRelations = {
    academicYear: true,
  } as const;

  async findMany(schoolId: string, query: ListAcademicEventsQuery) {
    const { page, limit, sortBy, order, academicYearId, eventType, from, to } = query;
    const where: Prisma.AcademicEventWhereInput = { schoolId };

    if (academicYearId) where.academicYearId = academicYearId;
    if (eventType) where.eventType = eventType;
    if (from || to) {
      where.startDate = {};
      if (from) where.startDate.gte = from;
      if (to) where.startDate.lte = to;
    }

    const [data, total] = await Promise.all([
      this.db.academicEvent.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
        include: this.includeRelations,
      }),
      this.db.academicEvent.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.academicEvent.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  async create(data: Prisma.AcademicEventCreateInput) {
    return this.db.academicEvent.create({ data, include: this.includeRelations });
  }

  async update(id: string, data: Prisma.AcademicEventUpdateInput) {
    return this.db.academicEvent.update({ where: { id }, data, include: this.includeRelations });
  }

  async delete(id: string) {
    return this.db.academicEvent.delete({ where: { id } });
  }
}
