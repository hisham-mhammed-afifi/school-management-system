import type { PrismaClient } from '../../generated/prisma/client.ts';
import { timeStringToDate } from './period.schema.ts';
import type { ReplacePeriodsInput } from './period.schema.ts';

export class PeriodRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findByPeriodSet(periodSetId: string) {
    return this.db.period.findMany({
      where: { periodSetId },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async replaceAll(schoolId: string, periodSetId: string, input: ReplacePeriodsInput) {
    return this.db.$transaction(async (tx) => {
      await tx.period.deleteMany({ where: { schoolId, periodSetId } });

      await Promise.all(
        input.periods.map((p) =>
          tx.period.create({
            data: {
              school: { connect: { id: schoolId } },
              periodSet: { connect: { id: periodSetId } },
              name: p.name,
              startTime: timeStringToDate(p.startTime),
              endTime: timeStringToDate(p.endTime),
              orderIndex: p.orderIndex,
              isBreak: p.isBreak,
            },
          }),
        ),
      );

      return tx.period.findMany({
        where: { schoolId, periodSetId },
        orderBy: { orderIndex: 'asc' },
      });
    });
  }
}
