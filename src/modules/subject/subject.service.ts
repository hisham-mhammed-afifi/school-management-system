import type { SubjectRepository } from './subject.repository.ts';
import type { CreateSubjectInput, UpdateSubjectInput, SetSubjectGradesInput, ListSubjectsQuery } from './subject.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class SubjectService {
  private readonly repo: SubjectRepository;
  constructor(repo: SubjectRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListSubjectsQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const subject = await this.repo.findById(id);
    if (!subject) throw new AppError('Subject not found', 404, 'SUBJECT_NOT_FOUND');
    return subject;
  }

  async create(schoolId: string, input: CreateSubjectInput) {
    return this.repo.create({ schoolId, ...input });
  }

  async update(id: string, input: UpdateSubjectInput) {
    await this.getById(id);
    return this.repo.update(id, input);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repo.delete(id);
  }

  async setGrades(schoolId: string, subjectId: string, input: SetSubjectGradesInput) {
    await this.getById(subjectId);
    return this.repo.setGrades(schoolId, subjectId, input.gradeIds);
  }

  async getByGrade(schoolId: string, gradeId: string) {
    return this.repo.findByGrade(schoolId, gradeId);
  }
}
