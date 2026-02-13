import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListReportCardsQuery } from './report-card.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class ReportCardRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  private readonly includeRelations = {
    student: true,
    term: true,
    classSection: true,
    generatedByUser: true,
  } as const;

  async findMany(schoolId: string, query: ListReportCardsQuery) {
    const { page, limit, sortBy, order, termId, classSectionId, studentId } = query;
    const where: Prisma.ReportCardSnapshotWhereInput = { schoolId };

    if (termId) where.termId = termId;
    if (classSectionId) where.classSectionId = classSectionId;
    if (studentId) where.studentId = studentId;

    const [data, total] = await Promise.all([
      this.db.reportCardSnapshot.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
        include: this.includeRelations,
      }),
      this.db.reportCardSnapshot.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.reportCardSnapshot.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  async update(id: string, data: Prisma.ReportCardSnapshotUpdateInput) {
    return this.db.reportCardSnapshot.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  async findExistingForTerm(schoolId: string, termId: string, studentIds: string[]) {
    return this.db.reportCardSnapshot.findMany({
      where: { schoolId, termId, studentId: { in: studentIds } },
      select: { studentId: true },
    });
  }

  async bulkCreate(snapshots: Prisma.ReportCardSnapshotCreateInput[]) {
    return this.db.$transaction(
      snapshots.map((s) => this.db.reportCardSnapshot.create({ data: s, include: this.includeRelations })),
    );
  }

  async getEnrolledStudents(classSectionId: string) {
    return this.db.studentEnrollment.findMany({
      where: { classSectionId, status: 'active' },
      include: { student: true },
    });
  }

  async getTermWithYear(termId: string) {
    return this.db.term.findUnique({
      where: { id: termId },
      include: { academicYear: true },
    });
  }

  async getGradesForStudents(schoolId: string, termId: string, studentIds: string[]) {
    return this.db.studentGrade.findMany({
      where: {
        schoolId,
        studentId: { in: studentIds },
        examSubject: { exam: { termId } },
      },
      include: {
        examSubject: {
          include: {
            subject: true,
            exam: {
              include: {
                gradingScale: { include: { levels: { orderBy: { orderIndex: 'asc' } } } },
              },
            },
          },
        },
      },
    });
  }
}
