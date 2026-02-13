import type { PrismaClient } from '../../generated/prisma/client.ts';

export class TimeSlotRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findByPeriodSet(schoolId: string, periodSetId: string) {
    return this.db.timeSlot.findMany({
      where: {
        schoolId,
        period: { periodSetId },
      },
      include: { period: true },
      orderBy: [{ dayOfWeek: 'asc' }, { period: { orderIndex: 'asc' } }],
    });
  }

  async generate(schoolId: string, periodSetId: string) {
    // Get active working days and non-break periods for this period set
    const [workingDays, periods] = await Promise.all([
      this.db.schoolWorkingDay.findMany({
        where: { schoolId, periodSetId, isActive: true },
      }),
      this.db.period.findMany({
        where: { schoolId, periodSetId, isBreak: false },
        orderBy: { orderIndex: 'asc' },
      }),
    ]);

    const details: Array<{
      dayOfWeek: number;
      periodId: string;
      periodName: string;
      startTime: Date;
      endTime: Date;
      isBreak: boolean;
    }> = [];

    for (const day of workingDays) {
      for (const period of periods) {
        // Upsert to be idempotent
        await this.db.timeSlot.upsert({
          where: {
            schoolId_dayOfWeek_periodId: {
              schoolId,
              dayOfWeek: day.dayOfWeek,
              periodId: period.id,
            },
          },
          create: {
            school: { connect: { id: schoolId } },
            dayOfWeek: day.dayOfWeek,
            period: { connect: { id: period.id } },
          },
          update: {},
          include: { period: true },
        });

        details.push({
          dayOfWeek: day.dayOfWeek,
          periodId: period.id,
          periodName: period.name,
          startTime: period.startTime,
          endTime: period.endTime,
          isBreak: period.isBreak,
        });
      }
    }

    return { totalSlotsGenerated: details.length, details };
  }
}
