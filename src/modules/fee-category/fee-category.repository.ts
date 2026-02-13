import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListFeeCategoriesQuery } from './fee-category.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class FeeCategoryRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findMany(schoolId: string, query: ListFeeCategoriesQuery) {
    const { page, limit, sortBy, order } = query;
    const where: Prisma.FeeCategoryWhereInput = { schoolId };

    const [data, total] = await Promise.all([
      this.db.feeCategory.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      this.db.feeCategory.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.feeCategory.findUnique({ where: { id } });
  }

  async create(data: Prisma.FeeCategoryCreateInput) {
    return this.db.feeCategory.create({ data });
  }

  async update(id: string, data: Prisma.FeeCategoryUpdateInput) {
    return this.db.feeCategory.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.db.feeCategory.delete({ where: { id } });
  }

  async hasStructures(id: string): Promise<boolean> {
    const count = await this.db.feeStructure.count({ where: { feeCategoryId: id } });
    return count > 0;
  }
}
