import type { TeacherRepository } from './teacher.repository.ts';
import type { CreateTeacherInput, UpdateTeacherInput, ListTeachersQuery, AssignSubjectsInput } from './teacher.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  active: ['on_leave', 'resigned', 'terminated'],
  on_leave: ['active', 'resigned', 'terminated'],
  resigned: [],
  terminated: [],
};

export class TeacherService {
  private readonly repo: TeacherRepository;
  constructor(repo: TeacherRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListTeachersQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const teacher = await this.repo.findById(id);
    if (!teacher) throw new AppError('Teacher not found', 404, 'TEACHER_NOT_FOUND');
    return teacher;
  }

  async create(schoolId: string, input: CreateTeacherInput) {
    const { departmentId, ...rest } = input;
    const data: Record<string, unknown> = {
      school: { connect: { id: schoolId } },
      ...rest,
    };
    if (departmentId) {
      data['department'] = { connect: { id: departmentId } };
    }
    return this.repo.create(data as never);
  }

  async update(id: string, input: UpdateTeacherInput) {
    const teacher = await this.getById(id);

    if (input.status && input.status !== teacher.status) {
      const allowed = VALID_STATUS_TRANSITIONS[teacher.status] ?? [];
      if (!allowed.includes(input.status)) {
        throw new AppError(
          `Cannot transition from '${teacher.status}' to '${input.status}'`,
          400,
          'INVALID_STATUS_TRANSITION',
        );
      }
    }

    const { departmentId, ...rest } = input;
    const data: Record<string, unknown> = { ...rest };
    if (departmentId !== undefined) {
      data['department'] = departmentId ? { connect: { id: departmentId } } : { disconnect: true };
      delete data['departmentId'];
    }
    return this.repo.update(id, data as never);
  }

  async assignSubjects(schoolId: string, id: string, input: AssignSubjectsInput) {
    await this.getById(id);
    return this.repo.replaceSubjects(schoolId, id, input.subjectIds);
  }

  async getSubjects(id: string) {
    await this.getById(id);
    return this.repo.findSubjects(id);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repo.softDelete(id);
  }
}
