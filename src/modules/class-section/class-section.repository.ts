import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListClassSectionsQuery } from './class-section.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

const SECTION_INCLUDE = {
  grade: true,
  academicYear: true,
  homeroomTeacher: true,
  _count: { select: { studentEnrollments: true } },
} as const;

export class ClassSectionRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findMany(schoolId: string, query: ListClassSectionsQuery) {
    const { page, limit, academicYearId, gradeId } = query;
    const where: Prisma.ClassSectionWhereInput = { schoolId };
    if (academicYearId) where.academicYearId = academicYearId;
    if (gradeId) where.gradeId = gradeId;

    const [data, total] = await Promise.all([
      this.db.classSection.findMany({
        where,
        include: SECTION_INCLUDE,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ grade: { levelOrder: 'asc' } }, { name: 'asc' }],
      }),
      this.db.classSection.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.classSection.findUnique({
      where: { id },
      include: SECTION_INCLUDE,
    });
  }

  async create(data: {
    schoolId: string;
    academicYearId: string;
    gradeId: string;
    name: string;
    capacity: number;
    homeroomTeacherId?: string;
  }) {
    return this.db.classSection.create({ data, include: SECTION_INCLUDE });
  }

  async update(id: string, data: Prisma.ClassSectionUpdateInput) {
    return this.db.classSection.update({ where: { id }, data, include: SECTION_INCLUDE });
  }

  async delete(id: string) {
    return this.db.classSection.delete({ where: { id } });
  }
}
