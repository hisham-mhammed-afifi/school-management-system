import type { AcademicYearRepository } from './academic-year.repository.ts';
import type { CreateAcademicYearInput, UpdateAcademicYearInput, ListAcademicYearsQuery } from './academic-year.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class AcademicYearService {
  private readonly repo: AcademicYearRepository;
  constructor(repo: AcademicYearRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListAcademicYearsQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const year = await this.repo.findById(id);
    if (!year) throw new AppError('Academic year not found', 404, 'ACADEMIC_YEAR_NOT_FOUND');
    return year;
  }

  async create(schoolId: string, input: CreateAcademicYearInput) {
    const overlap = await this.repo.findOverlapping(schoolId, input.startDate, input.endDate);
    if (overlap) throw new AppError('Academic year dates overlap an existing year', 409, 'ACADEMIC_YEAR_OVERLAP');

    return this.repo.create({ schoolId, ...input });
  }

  async update(id: string, input: UpdateAcademicYearInput) {
    const year = await this.getById(id);

    const startDate = input.startDate ?? year.startDate;
    const endDate = input.endDate ?? year.endDate;
    if (input.startDate || input.endDate) {
      const overlap = await this.repo.findOverlapping(year.schoolId, startDate, endDate, id);
      if (overlap) throw new AppError('Academic year dates overlap an existing year', 409, 'ACADEMIC_YEAR_OVERLAP');
    }

    return this.repo.update(id, input);
  }

  async activate(id: string) {
    const year = await this.getById(id);
    return this.repo.activate(year.schoolId, id);
  }

  async remove(id: string) {
    await this.getById(id);
    const hasDeps = await this.repo.hasDependents(id);
    if (hasDeps) {
      throw new AppError('Cannot delete academic year with dependent data', 409, 'YEAR_HAS_DEPENDENTS');
    }
    await this.repo.delete(id);
  }
}
