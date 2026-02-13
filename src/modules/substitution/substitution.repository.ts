import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListSubstitutionsQuery } from './substitution.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class SubstitutionRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  private readonly includeRelations = {
    lesson: { include: { subject: true, classSection: true, timeSlot: { include: { period: true } } } },
    originalTeacher: true,
    substituteTeacher: true,
    approvedByUser: true,
  } as const;

  async findMany(schoolId: string, query: ListSubstitutionsQuery) {
    const { page, limit, sortBy, order, date, teacherId } = query;
    const where: Prisma.SubstitutionWhereInput = { schoolId };

    if (date) where.date = date;
    if (teacherId) where.substituteTeacherId = teacherId;

    const [data, total] = await Promise.all([
      this.db.substitution.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
        include: this.includeRelations,
      }),
      this.db.substitution.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.substitution.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  async create(data: Prisma.SubstitutionCreateInput) {
    return this.db.substitution.create({
      data,
      include: this.includeRelations,
    });
  }

  async update(id: string, data: Prisma.SubstitutionUpdateInput) {
    return this.db.substitution.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  async delete(id: string) {
    return this.db.substitution.delete({ where: { id } });
  }

  async hasConflictingSubstitution(substituteTeacherId: string, date: Date, timeSlotId: string, excludeId?: string) {
    const where: Prisma.SubstitutionWhereInput = {
      substituteTeacherId,
      date,
      lesson: { timeSlotId },
    };
    if (excludeId) where.id = { not: excludeId };
    return (await this.db.substitution.count({ where })) > 0;
  }
}
