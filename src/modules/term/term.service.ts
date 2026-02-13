import type { TermRepository } from './term.repository.ts';
import type { CreateTermInput, UpdateTermInput } from './term.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';
import type { AcademicYearRepository } from '../academic-year/academic-year.repository.ts';

export class TermService {
  private readonly termRepo: TermRepository;
  private readonly yearRepo: AcademicYearRepository;
  constructor(termRepo: TermRepository, yearRepo: AcademicYearRepository) {
    this.termRepo = termRepo;
    this.yearRepo = yearRepo;
  }

  async listByYear(yearId: string) {
    await this.ensureYearExists(yearId);
    return this.termRepo.findByYearId(yearId);
  }

  async getById(id: string) {
    const term = await this.termRepo.findById(id);
    if (!term) throw new AppError('Term not found', 404, 'TERM_NOT_FOUND');
    return term;
  }

  async create(yearId: string, schoolId: string, input: CreateTermInput) {
    const year = await this.ensureYearExists(yearId);

    // Validate dates within year range
    if (input.startDate < year.startDate || input.endDate > year.endDate) {
      throw new AppError('Term dates must fall within the academic year', 422, 'TERM_OUTSIDE_YEAR');
    }

    // Check overlap
    const overlap = await this.termRepo.findOverlapping(yearId, input.startDate, input.endDate);
    if (overlap) throw new AppError('Term dates overlap another term', 409, 'TERM_OVERLAP');

    return this.termRepo.create({
      schoolId,
      academicYearId: yearId,
      ...input,
    });
  }

  async update(id: string, input: UpdateTermInput) {
    const term = await this.getById(id);
    const year = await this.ensureYearExists(term.academicYearId);

    const startDate = input.startDate ?? term.startDate;
    const endDate = input.endDate ?? term.endDate;

    if (startDate < year.startDate || endDate > year.endDate) {
      throw new AppError('Term dates must fall within the academic year', 422, 'TERM_OUTSIDE_YEAR');
    }

    if (input.startDate || input.endDate) {
      const overlap = await this.termRepo.findOverlapping(term.academicYearId, startDate, endDate, id);
      if (overlap) throw new AppError('Term dates overlap another term', 409, 'TERM_OVERLAP');
    }

    return this.termRepo.update(id, input);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.termRepo.delete(id);
  }

  private async ensureYearExists(yearId: string) {
    const year = await this.yearRepo.findById(yearId);
    if (!year) throw new AppError('Academic year not found', 404, 'ACADEMIC_YEAR_NOT_FOUND');
    return year;
  }
}
