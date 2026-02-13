import type { StudentRepository } from './student.repository.ts';
import type { CreateStudentInput, UpdateStudentInput, ListStudentsQuery } from './student.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  active: ['withdrawn', 'suspended', 'transferred', 'graduated'],
  suspended: ['active', 'withdrawn'],
  withdrawn: [],
  transferred: [],
  graduated: [],
};

export class StudentService {
  private readonly repo: StudentRepository;
  constructor(repo: StudentRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListStudentsQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const student = await this.repo.findById(id);
    if (!student) throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
    return student;
  }

  async create(schoolId: string, input: CreateStudentInput) {
    return this.repo.create({
      school: { connect: { id: schoolId } },
      ...input,
    });
  }

  async update(id: string, input: UpdateStudentInput) {
    const student = await this.getById(id);

    if (input.status && input.status !== student.status) {
      const allowed = VALID_STATUS_TRANSITIONS[student.status] ?? [];
      if (!allowed.includes(input.status)) {
        throw new AppError(
          `Cannot transition from '${student.status}' to '${input.status}'`,
          400,
          'INVALID_STATUS_TRANSITION',
        );
      }
    }

    return this.repo.update(id, input);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repo.softDelete(id);
  }
}
