import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListAcademicYearsQuery } from './academic-year.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class AcademicYearRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findMany(schoolId: string, query: ListAcademicYearsQuery) {
    const { page, limit, isActive } = query;
    const where: Prisma.AcademicYearWhereInput = { schoolId };
    if (isActive !== undefined) where.isActive = isActive;

    const [data, total] = await Promise.all([
      this.db.academicYear.findMany({
        where,
        include: { terms: { orderBy: { orderIndex: 'asc' } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startDate: 'desc' },
      }),
      this.db.academicYear.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.academicYear.findUnique({
      where: { id },
      include: { terms: { orderBy: { orderIndex: 'asc' } } },
    });
  }

  async findOverlapping(schoolId: string, startDate: Date, endDate: Date, excludeId?: string) {
    const where: Prisma.AcademicYearWhereInput = {
      schoolId,
      startDate: { lt: endDate },
      endDate: { gt: startDate },
    };
    if (excludeId) where.id = { not: excludeId };
    return this.db.academicYear.findFirst({ where });
  }

  async create(data: { schoolId: string; name: string; startDate: Date; endDate: Date }) {
    return this.db.academicYear.create({
      data,
      include: { terms: true },
    });
  }

  async update(id: string, data: Prisma.AcademicYearUpdateInput) {
    return this.db.academicYear.update({
      where: { id },
      data,
      include: { terms: { orderBy: { orderIndex: 'asc' } } },
    });
  }

  async activate(schoolId: string, id: string) {
    // Deactivate all, then activate the target — inside a transaction
    return this.db.$transaction(async (tx) => {
      await tx.academicYear.updateMany({
        where: { schoolId, isActive: true },
        data: { isActive: false },
      });
      return tx.academicYear.update({
        where: { id },
        data: { isActive: true },
        include: { terms: { orderBy: { orderIndex: 'asc' } } },
      });
    });
  }

  async delete(id: string) {
    return this.db.academicYear.delete({ where: { id } });
  }

  async hasDependents(id: string): Promise<boolean> {
    const [terms, enrollments, lessons] = await Promise.all([
      this.db.term.count({ where: { academicYearId: id } }),
      this.db.studentEnrollment.count({ where: { academicYearId: id } }),
      this.db.lesson.count({ where: { academicYearId: id } }),
    ]);
    return terms + enrollments + lessons > 0;
  }
}
