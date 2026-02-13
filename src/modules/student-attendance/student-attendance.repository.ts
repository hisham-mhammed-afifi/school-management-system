import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListStudentAttendanceQuery, AttendanceSummaryQuery } from './student-attendance.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class StudentAttendanceRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  private readonly includeRelations = {
    student: true,
    classSection: true,
    lesson: true,
    recordedByUser: true,
  } as const;

  async findMany(schoolId: string, query: ListStudentAttendanceQuery) {
    const { page, limit, sortBy, order, classSectionId, studentId, date, status } = query;
    const where: Prisma.StudentAttendanceWhereInput = { schoolId };

    if (classSectionId) where.classSectionId = classSectionId;
    if (studentId) where.studentId = studentId;
    if (date) where.date = date;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.db.studentAttendance.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
        include: this.includeRelations,
      }),
      this.db.studentAttendance.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.studentAttendance.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  async bulkUpsert(
    schoolId: string,
    classSectionId: string,
    date: Date,
    lessonId: string | undefined,
    recordedBy: string,
    records: Array<{ studentId: string; status: string; notes?: string }>,
  ) {
    return this.db.$transaction(async (tx) => {
      const results = await Promise.all(
        records.map((record) => {
          const data: Prisma.StudentAttendanceCreateInput = {
            school: { connect: { id: schoolId } },
            student: { connect: { id: record.studentId } },
            classSection: { connect: { id: classSectionId } },
            date,
            status: record.status as 'present' | 'absent' | 'late' | 'excused',
            recordedByUser: { connect: { id: recordedBy } },
            ...(record.notes ? { notes: record.notes } : {}),
            ...(lessonId ? { lesson: { connect: { id: lessonId } } } : {}),
          };

          return tx.studentAttendance.create({
            data,
            include: this.includeRelations,
          });
        }),
      );

      return results;
    });
  }

  async update(id: string, data: Prisma.StudentAttendanceUpdateInput) {
    return this.db.studentAttendance.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  async getSummary(schoolId: string, query: AttendanceSummaryQuery) {
    const where: Prisma.StudentAttendanceWhereInput = {
      schoolId,
      classSectionId: query.classSectionId,
      date: { gte: query.dateFrom, lte: query.dateTo },
    };
    if (query.studentId) where.studentId = query.studentId;

    const records = await this.db.studentAttendance.groupBy({
      by: ['studentId', 'status'],
      where,
      _count: { status: true },
    });

    return records;
  }
}
