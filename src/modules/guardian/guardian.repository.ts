import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListGuardiansQuery } from './guardian.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

const NOT_DELETED: Prisma.GuardianWhereInput = { deletedAt: null };

export class GuardianRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findMany(schoolId: string, query: ListGuardiansQuery) {
    const { page, limit, search, sortBy, order } = query;
    const where: Prisma.GuardianWhereInput = { schoolId, ...NOT_DELETED };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.db.guardian.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      this.db.guardian.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.guardian.findFirst({
      where: { id, ...NOT_DELETED },
    });
  }

  async create(data: Prisma.GuardianCreateInput) {
    return this.db.guardian.create({ data });
  }

  async update(id: string, data: Prisma.GuardianUpdateInput) {
    return this.db.guardian.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return this.db.guardian.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
