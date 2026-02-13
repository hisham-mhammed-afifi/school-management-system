import type { EnrollmentRepository } from './enrollment.repository.ts';
import type { CreateEnrollmentInput, UpdateEnrollmentInput, ListEnrollmentsQuery, BulkPromoteInput } from './enrollment.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  active: ['withdrawn', 'transferred', 'promoted'],
  withdrawn: [],
  transferred: [],
  promoted: [],
};

export class EnrollmentService {
  private readonly repo: EnrollmentRepository;
  constructor(repo: EnrollmentRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListEnrollmentsQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const enrollment = await this.repo.findById(id);
    if (!enrollment) throw new AppError('Enrollment not found', 404, 'ENROLLMENT_NOT_FOUND');
    return enrollment;
  }

  async create(schoolId: string, input: CreateEnrollmentInput) {
    // Check for duplicate enrollment in same academic year
    const existing = await this.repo.findActiveByStudentAndYear(schoolId, input.studentId, input.academicYearId);
    if (existing) {
      throw new AppError(
        'Student already enrolled for this academic year',
        409,
        'ENROLLMENT_DUPLICATE',
      );
    }

    return this.repo.create({
      school: { connect: { id: schoolId } },
      student: { connect: { id: input.studentId } },
      classSection: { connect: { id: input.classSectionId } },
      academicYear: { connect: { id: input.academicYearId } },
      enrolledAt: input.enrolledAt,
      notes: input.notes,
    });
  }

  async update(id: string, input: UpdateEnrollmentInput) {
    const enrollment = await this.getById(id);

    if (input.status && input.status !== enrollment.status) {
      const allowed = VALID_STATUS_TRANSITIONS[enrollment.status] ?? [];
      if (!allowed.includes(input.status)) {
        throw new AppError(
          `Cannot transition from '${enrollment.status}' to '${input.status}'`,
          400,
          'INVALID_STATUS_TRANSITION',
        );
      }
    }

    return this.repo.update(id, input);
  }

  async bulkPromote(schoolId: string, input: BulkPromoteInput) {
    return this.repo.bulkPromote(
      schoolId,
      input.sourceClassSectionId,
      input.targetClassSectionId,
      input.targetAcademicYearId,
      input.studentIds,
    );
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repo.delete(id);
  }
}
