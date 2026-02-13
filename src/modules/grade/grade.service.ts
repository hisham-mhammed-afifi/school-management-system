import type { GradeRepository } from './grade.repository.ts';
import type { CreateGradeInput, UpdateGradeInput, ListGradesQuery } from './grade.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class GradeService {
  private readonly repo: GradeRepository;
  constructor(repo: GradeRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListGradesQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const grade = await this.repo.findById(id);
    if (!grade) throw new AppError('Grade not found', 404, 'GRADE_NOT_FOUND');
    return grade;
  }

  async create(schoolId: string, input: CreateGradeInput) {
    return this.repo.create({ schoolId, ...input });
  }

  async update(id: string, input: UpdateGradeInput) {
    await this.getById(id);
    return this.repo.update(id, input);
  }

  async remove(id: string) {
    await this.getById(id);
    const inUse = await this.repo.hasDependents(id);
    if (inUse) throw new AppError('Grade is in use and cannot be deleted', 409, 'GRADE_IN_USE');
    await this.repo.delete(id);
  }
}
