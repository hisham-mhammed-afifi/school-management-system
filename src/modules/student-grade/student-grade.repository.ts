import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListGradesQuery } from './student-grade.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class StudentGradeRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  private readonly includeRelations = {
    student: true,
    examSubject: { include: { subject: true, grade: true, exam: true } },
    gradedByUser: true,
  } as const;

  async findMany(schoolId: string, query: ListGradesQuery) {
    const { page, limit, sortBy, order, examSubjectId, studentId } = query;
    const where: Prisma.StudentGradeWhereInput = { schoolId };

    if (examSubjectId) where.examSubjectId = examSubjectId;
    if (studentId) where.studentId = studentId;

    const [data, total] = await Promise.all([
      this.db.studentGrade.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
        include: this.includeRelations,
      }),
      this.db.studentGrade.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.studentGrade.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  async bulkCreate(
    schoolId: string,
    examSubjectId: string,
    gradedBy: string,
    grades: Array<{ studentId: string; score: number; gradeLetter: string | null; notes?: string }>,
  ) {
    return this.db.$transaction(
      grades.map((g) =>
        this.db.studentGrade.create({
          data: {
            school: { connect: { id: schoolId } },
            student: { connect: { id: g.studentId } },
            examSubject: { connect: { id: examSubjectId } },
            score: g.score,
            gradeLetter: g.gradeLetter,
            gradedByUser: { connect: { id: gradedBy } },
            gradedAt: new Date(),
            ...(g.notes ? { notes: g.notes } : {}),
          },
          include: this.includeRelations,
        }),
      ),
    );
  }

  async update(id: string, data: Prisma.StudentGradeUpdateInput) {
    return this.db.studentGrade.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  async findExamSubjectWithScale(examSubjectId: string) {
    return this.db.examSubject.findUnique({
      where: { id: examSubjectId },
      include: {
        exam: {
          include: {
            gradingScale: {
              include: { levels: { orderBy: { orderIndex: 'asc' } } },
            },
          },
        },
      },
    });
  }

  async findGradesForReport(schoolId: string, termId: string, classSectionId: string) {
    // First get student IDs enrolled in this class section
    const enrollments = await this.db.studentEnrollment.findMany({
      where: { classSectionId, status: 'active' },
      select: { studentId: true },
    });
    const studentIds = enrollments.map((e) => e.studentId);

    if (studentIds.length === 0) return [];

    return this.db.studentGrade.findMany({
      where: {
        schoolId,
        studentId: { in: studentIds },
        examSubject: { exam: { termId } },
      },
      include: {
        student: true,
        examSubject: {
          include: {
            subject: true,
            exam: { include: { gradingScale: { include: { levels: { orderBy: { orderIndex: 'asc' } } } } } },
          },
        },
      },
    });
  }
}
