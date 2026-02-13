import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListFeeDiscountsQuery } from './fee-discount.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class FeeDiscountRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  private readonly includeRelations = {
    student: true,
    feeStructure: { include: { feeCategory: true } },
    approvedByUser: true,
  } as const;

  async findMany(schoolId: string, query: ListFeeDiscountsQuery) {
    const { page, limit, sortBy, order, studentId, feeStructureId } = query;
    const where: Prisma.FeeDiscountWhereInput = { schoolId };

    if (studentId) where.studentId = studentId;
    if (feeStructureId) where.feeStructureId = feeStructureId;

    const [data, total] = await Promise.all([
      this.db.feeDiscount.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
        include: this.includeRelations,
      }),
      this.db.feeDiscount.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.feeDiscount.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  async create(data: Prisma.FeeDiscountCreateInput) {
    return this.db.feeDiscount.create({ data, include: this.includeRelations });
  }

  async update(id: string, data: Prisma.FeeDiscountUpdateInput) {
    return this.db.feeDiscount.update({ where: { id }, data, include: this.includeRelations });
  }

  async delete(id: string) {
    return this.db.feeDiscount.delete({ where: { id } });
  }

  async findByStudentAndStructures(schoolId: string, studentId: string, feeStructureIds: string[]) {
    return this.db.feeDiscount.findMany({
      where: { schoolId, studentId, feeStructureId: { in: feeStructureIds } },
    });
  }
}
