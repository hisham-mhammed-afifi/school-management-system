import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListFeeStructuresQuery } from './fee-structure.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class FeeStructureRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  private readonly includeRelations = {
    academicYear: true,
    grade: true,
    feeCategory: true,
  } as const;

  async findMany(schoolId: string, query: ListFeeStructuresQuery) {
    const { page, limit, sortBy, order, academicYearId, gradeId, feeCategoryId, isRecurring } = query;
    const where: Prisma.FeeStructureWhereInput = { schoolId };

    if (academicYearId) where.academicYearId = academicYearId;
    if (gradeId) where.gradeId = gradeId;
    if (feeCategoryId) where.feeCategoryId = feeCategoryId;
    if (isRecurring !== undefined) where.isRecurring = isRecurring;

    const [data, total] = await Promise.all([
      this.db.feeStructure.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
        include: this.includeRelations,
      }),
      this.db.feeStructure.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.feeStructure.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  async create(data: Prisma.FeeStructureCreateInput) {
    return this.db.feeStructure.create({ data, include: this.includeRelations });
  }

  async update(id: string, data: Prisma.FeeStructureUpdateInput) {
    return this.db.feeStructure.update({ where: { id }, data, include: this.includeRelations });
  }

  async delete(id: string) {
    return this.db.feeStructure.delete({ where: { id } });
  }
}
