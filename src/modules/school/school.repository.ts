import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { CreateSchoolInput, UpdateSchoolInput, UpdateSchoolProfileInput, ListSchoolsQuery } from './school.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class SchoolRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findMany(query: ListSchoolsQuery) {
    const { page, limit, search, sortBy, order, status, plan } = query;
    const where: Prisma.SchoolWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (plan) where.subscriptionPlan = plan;

    const [data, total] = await Promise.all([
      this.db.school.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      this.db.school.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.school.findUnique({ where: { id } });
  }

  async findByCode(code: string) {
    return this.db.school.findUnique({ where: { code } });
  }

  async create(data: CreateSchoolInput) {
    return this.db.school.create({ data });
  }

  async update(id: string, data: UpdateSchoolInput | UpdateSchoolProfileInput) {
    return this.db.school.update({ where: { id }, data });
  }
}
