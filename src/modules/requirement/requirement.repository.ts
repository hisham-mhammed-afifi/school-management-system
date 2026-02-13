import type { PrismaClient } from '../../generated/prisma/client.ts';

export class RequirementRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findBySectionId(sectionId: string) {
    return this.db.classSubjectRequirement.findMany({
      where: { classSectionId: sectionId },
      include: { subject: true },
      orderBy: { subject: { name: 'asc' } },
    });
  }

  async replaceForSection(
    schoolId: string,
    academicYearId: string,
    sectionId: string,
    requirements: Array<{ subjectId: string; weeklyLessonsRequired: number }>,
  ) {
    return this.db.$transaction(async (tx) => {
      await tx.classSubjectRequirement.deleteMany({
        where: { classSectionId: sectionId },
      });

      if (requirements.length > 0) {
        await tx.classSubjectRequirement.createMany({
          data: requirements.map((r) => ({
            schoolId,
            academicYearId,
            classSectionId: sectionId,
            subjectId: r.subjectId,
            weeklyLessonsRequired: r.weeklyLessonsRequired,
          })),
        });
      }

      return tx.classSubjectRequirement.findMany({
        where: { classSectionId: sectionId },
        include: { subject: true },
        orderBy: { subject: { name: 'asc' } },
      });
    });
  }
}
