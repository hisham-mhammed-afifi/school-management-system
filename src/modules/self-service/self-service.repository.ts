import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { PaginationQuery, TimetableQuery, AttendanceQuery, GradesQuery, SubmitLeaveInput } from './self-service.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class SelfServiceRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  // ---- User resolution ----

  async getUserWithLinks(userId: string) {
    return this.db.user.findUnique({
      where: { id: userId },
      select: { id: true, teacherId: true, studentId: true, guardianId: true, schoolId: true },
    });
  }

  // ---- Teacher self-service ----

  async getTeacherTimetable(teacherId: string, query: TimetableQuery) {
    const where: Prisma.LessonWhereInput = { teacherId };
    if (query.termId) where.termId = query.termId;

    return this.db.lesson.findMany({
      where,
      include: {
        subject: true,
        classSection: { include: { grade: true } },
        room: true,
        timeSlot: { include: { period: true } },
      },
      orderBy: [{ timeSlot: { dayOfWeek: 'asc' } }, { timeSlot: { period: { orderIndex: 'asc' } } }],
    });
  }

  async getTeacherClasses(teacherId: string) {
    return this.db.lesson.findMany({
      where: { teacherId },
      select: {
        classSectionId: true,
        classSection: { include: { grade: true } },
        subject: true,
      },
      distinct: ['classSectionId', 'subjectId'],
    });
  }

  async getTeacherLeaves(teacherId: string, query: PaginationQuery) {
    const where: Prisma.TeacherLeaveWhereInput = { teacherId };
    const [data, total] = await Promise.all([
      this.db.teacherLeave.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.teacherLeave.count({ where }),
    ]);
    return buildPaginatedResult(data, total, query);
  }

  async createTeacherLeave(schoolId: string, teacherId: string, input: SubmitLeaveInput) {
    return this.db.teacherLeave.create({
      data: {
        school: { connect: { id: schoolId } },
        teacher: { connect: { id: teacherId } },
        leaveType: input.leaveType,
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        reason: input.reason ?? null,
      },
    });
  }

  async getTeacherSubstitutions(teacherId: string, query: PaginationQuery) {
    const where: Prisma.SubstitutionWhereInput = { substituteTeacherId: teacherId };
    const [data, total] = await Promise.all([
      this.db.substitution.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { date: 'desc' },
        include: {
          lesson: { include: { subject: true, classSection: true } },
          originalTeacher: { select: { firstName: true, lastName: true } },
        },
      }),
      this.db.substitution.count({ where }),
    ]);
    return buildPaginatedResult(data, total, query);
  }

  // ---- Student self-service ----

  async getStudentTimetable(studentId: string, query: TimetableQuery) {
    // Get student's active enrollment to find their class section
    const enrollment = await this.db.studentEnrollment.findFirst({
      where: { studentId, status: 'active' },
      select: { classSectionId: true },
    });
    if (!enrollment) return [];

    const where: Prisma.LessonWhereInput = { classSectionId: enrollment.classSectionId };
    if (query.termId) where.termId = query.termId;

    return this.db.lesson.findMany({
      where,
      include: {
        subject: true,
        teacher: { select: { firstName: true, lastName: true } },
        room: true,
        timeSlot: { include: { period: true } },
      },
      orderBy: [{ timeSlot: { dayOfWeek: 'asc' } }, { timeSlot: { period: { orderIndex: 'asc' } } }],
    });
  }

  async getStudentGrades(studentId: string, query: GradesQuery) {
    const where: Prisma.StudentGradeWhereInput = { studentId };
    if (query.examId) where.examSubject = { examId: query.examId };
    if (query.termId) where.examSubject = { ...where.examSubject as object, exam: { termId: query.termId } };

    const [data, total] = await Promise.all([
      this.db.studentGrade.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          examSubject: {
            include: { subject: true, exam: { select: { name: true, examType: true, termId: true } } },
          },
        },
      }),
      this.db.studentGrade.count({ where }),
    ]);
    return buildPaginatedResult(data, total, query);
  }

  async getStudentAttendance(studentId: string, query: AttendanceQuery) {
    const where: Prisma.StudentAttendanceWhereInput = { studentId };
    if (query.from || query.to) {
      where.date = {};
      if (query.from) where.date.gte = query.from;
      if (query.to) where.date.lte = query.to;
    }

    const [data, total] = await Promise.all([
      this.db.studentAttendance.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { date: 'desc' },
      }),
      this.db.studentAttendance.count({ where }),
    ]);
    return buildPaginatedResult(data, total, query);
  }

  async getStudentReportCards(studentId: string, query: PaginationQuery) {
    const where: Prisma.ReportCardSnapshotWhereInput = { studentId };
    const [data, total] = await Promise.all([
      this.db.reportCardSnapshot.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.reportCardSnapshot.count({ where }),
    ]);
    return buildPaginatedResult(data, total, query);
  }

  async getStudentInvoices(studentId: string, query: PaginationQuery) {
    const where: Prisma.FeeInvoiceWhereInput = { studentId };
    const [data, total] = await Promise.all([
      this.db.feeInvoice.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true, payments: true },
      }),
      this.db.feeInvoice.count({ where }),
    ]);
    return buildPaginatedResult(data, total, query);
  }

  // ---- Guardian self-service ----

  async getGuardianChildren(guardianId: string) {
    const links = await this.db.studentGuardian.findMany({
      where: { guardianId },
      include: {
        student: {
          include: {
            studentEnrollments: {
              where: { status: 'active' },
              include: { classSection: { include: { grade: true } } },
              take: 1,
            },
          },
        },
      },
    });
    return links.map((l) => ({
      studentId: l.studentId,
      firstName: l.student.firstName,
      lastName: l.student.lastName,
      studentCode: l.student.studentCode,
      relationshipType: l.relationshipType,
      isPrimary: l.isPrimary,
      enrollment: l.student.studentEnrollments[0] ?? null,
    }));
  }

  async isGuardianOfStudent(guardianId: string, studentId: string): Promise<boolean> {
    const count = await this.db.studentGuardian.count({
      where: { guardianId, studentId },
    });
    return count > 0;
  }
}
