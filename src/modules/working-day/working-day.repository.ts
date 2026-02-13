import type { PrismaClient } from '../../generated/prisma/client.ts';
import type { ReplaceWorkingDaysInput } from './working-day.schema.ts';

export class WorkingDayRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findByPeriodSet(periodSetId: string) {
    return this.db.schoolWorkingDay.findMany({
      where: { periodSetId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async replaceAll(schoolId: string, periodSetId: string, input: ReplaceWorkingDaysInput) {
    return this.db.$transaction(async (tx) => {
      await tx.schoolWorkingDay.deleteMany({ where: { schoolId, periodSetId } });

      await Promise.all(
        input.workingDays.map((day) =>
          tx.schoolWorkingDay.create({
            data: {
              school: { connect: { id: schoolId } },
              periodSet: { connect: { id: periodSetId } },
              dayOfWeek: day.dayOfWeek,
              isActive: day.isActive,
            },
          }),
        ),
      );

      return tx.schoolWorkingDay.findMany({
        where: { schoolId, periodSetId },
        orderBy: { dayOfWeek: 'asc' },
      });
    });
  }
}
