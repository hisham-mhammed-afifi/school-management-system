import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListDepartmentsQuery } from './department.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

const DEPT_INCLUDE = { headTeacher: true } as const;

export class DepartmentRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findMany(schoolId: string, query: ListDepartmentsQuery) {
    const { page, limit, search } = query;
    const where: Prisma.DepartmentWhereInput = { schoolId };
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.db.department.findMany({
        where,
        include: DEPT_INCLUDE,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.db.department.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.department.findUnique({ where: { id }, include: DEPT_INCLUDE });
  }

  async create(data: { schoolId: string; name: string; headTeacherId?: string }) {
    return this.db.department.create({ data, include: DEPT_INCLUDE });
  }

  async update(id: string, data: Prisma.DepartmentUpdateInput) {
    return this.db.department.update({ where: { id }, data, include: DEPT_INCLUDE });
  }

  async delete(id: string) {
    return this.db.department.delete({ where: { id } });
  }
}
