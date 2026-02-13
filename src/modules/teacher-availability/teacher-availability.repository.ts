import type { PrismaClient } from '../../generated/prisma/client.ts';
import type { ReplaceAvailabilityInput } from './teacher-availability.schema.ts';

export class TeacherAvailabilityRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findByTeacher(teacherId: string) {
    return this.db.teacherAvailability.findMany({
      where: { teacherId },
      include: { period: true },
      orderBy: [{ dayOfWeek: 'asc' }, { period: { orderIndex: 'asc' } }],
    });
  }

  async replaceAll(schoolId: string, teacherId: string, input: ReplaceAvailabilityInput) {
    return this.db.$transaction(async (tx) => {
      await tx.teacherAvailability.deleteMany({ where: { schoolId, teacherId } });

      await Promise.all(
        input.slots.map((slot) =>
          tx.teacherAvailability.create({
            data: {
              school: { connect: { id: schoolId } },
              teacher: { connect: { id: teacherId } },
              dayOfWeek: slot.dayOfWeek,
              period: { connect: { id: slot.periodId } },
              isAvailable: slot.isAvailable,
            },
          }),
        ),
      );

      return tx.teacherAvailability.findMany({
        where: { schoolId, teacherId },
        include: { period: true },
        orderBy: [{ dayOfWeek: 'asc' }, { period: { orderIndex: 'asc' } }],
      });
    });
  }
}
