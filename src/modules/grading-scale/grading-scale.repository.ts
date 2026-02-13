import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListGradingScalesQuery } from './grading-scale.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class GradingScaleRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  private readonly includeRelations = {
    levels: { orderBy: { orderIndex: 'asc' as const } },
  } as const;

  async findMany(schoolId: string, query: ListGradingScalesQuery) {
    const { page, limit, sortBy, order } = query;
    const where: Prisma.GradingScaleWhereInput = { schoolId };

    const [data, total] = await Promise.all([
      this.db.gradingScale.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
        include: this.includeRelations,
      }),
      this.db.gradingScale.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.gradingScale.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  async create(schoolId: string, name: string, levels: Array<{ letter: string; minScore: number; maxScore: number; gpaPoints?: number; orderIndex: number }>) {
    return this.db.gradingScale.create({
      data: {
        school: { connect: { id: schoolId } },
        name,
        levels: {
          create: levels.map((l) => ({
            letter: l.letter,
            minScore: l.minScore,
            maxScore: l.maxScore,
            gpaPoints: l.gpaPoints ?? null,
            orderIndex: l.orderIndex,
          })),
        },
      },
      include: this.includeRelations,
    });
  }

  async update(id: string, name: string | undefined, levels: Array<{ letter: string; minScore: number; maxScore: number; gpaPoints?: number; orderIndex: number }> | undefined) {
    return this.db.$transaction(async (tx) => {
      if (levels) {
        await tx.gradingScaleLevel.deleteMany({ where: { gradingScaleId: id } });
        await Promise.all(
          levels.map((l) =>
            tx.gradingScaleLevel.create({
              data: {
                gradingScale: { connect: { id } },
                letter: l.letter,
                minScore: l.minScore,
                maxScore: l.maxScore,
                gpaPoints: l.gpaPoints ?? null,
                orderIndex: l.orderIndex,
              },
            }),
          ),
        );
      }

      if (name !== undefined) {
        await tx.gradingScale.update({ where: { id }, data: { name } });
      }

      return tx.gradingScale.findUnique({
        where: { id },
        include: this.includeRelations,
      });
    });
  }

  async delete(id: string) {
    return this.db.gradingScale.delete({ where: { id } });
  }

  async isUsedByExams(id: string): Promise<boolean> {
    const count = await this.db.exam.count({ where: { gradingScaleId: id } });
    return count > 0;
  }
}
