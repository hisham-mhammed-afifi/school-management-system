import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListEnrollmentsQuery } from './enrollment.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class EnrollmentRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findMany(schoolId: string, query: ListEnrollmentsQuery) {
    const { page, limit, sortBy, order, status, academicYearId, classSectionId, studentId } = query;
    const where: Prisma.StudentEnrollmentWhereInput = { schoolId };

    if (status) where.status = status;
    if (academicYearId) where.academicYearId = academicYearId;
    if (classSectionId) where.classSectionId = classSectionId;
    if (studentId) where.studentId = studentId;

    const [data, total] = await Promise.all([
      this.db.studentEnrollment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
        include: { student: true, classSection: true, academicYear: true },
      }),
      this.db.studentEnrollment.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.studentEnrollment.findUnique({
      where: { id },
      include: { student: true, classSection: true, academicYear: true },
    });
  }

  async findActiveByStudentAndYear(schoolId: string, studentId: string, academicYearId: string) {
    return this.db.studentEnrollment.findUnique({
      where: {
        schoolId_studentId_academicYearId: { schoolId, studentId, academicYearId },
      },
    });
  }

  async create(data: Prisma.StudentEnrollmentCreateInput) {
    return this.db.studentEnrollment.create({
      data,
      include: { student: true, classSection: true, academicYear: true },
    });
  }

  async update(id: string, data: Prisma.StudentEnrollmentUpdateInput) {
    return this.db.studentEnrollment.update({
      where: { id },
      data,
      include: { student: true, classSection: true, academicYear: true },
    });
  }

  async bulkPromote(
    schoolId: string,
    sourceClassSectionId: string,
    targetClassSectionId: string,
    targetAcademicYearId: string,
    studentIds: string[],
  ) {
    return this.db.$transaction(async (tx) => {
      // Mark old enrollments as promoted
      await tx.studentEnrollment.updateMany({
        where: {
          schoolId,
          classSectionId: sourceClassSectionId,
          studentId: { in: studentIds },
          status: 'active',
        },
        data: { status: 'promoted' },
      });

      // Create new enrollments
      const newEnrollments = await Promise.all(
        studentIds.map((studentId) =>
          tx.studentEnrollment.create({
            data: {
              school: { connect: { id: schoolId } },
              student: { connect: { id: studentId } },
              classSection: { connect: { id: targetClassSectionId } },
              academicYear: { connect: { id: targetAcademicYearId } },
              enrolledAt: new Date(),
              status: 'active',
            },
            include: { student: true, classSection: true, academicYear: true },
          }),
        ),
      );

      return newEnrollments;
    });
  }

  async delete(id: string) {
    return this.db.studentEnrollment.delete({ where: { id } });
  }
}
