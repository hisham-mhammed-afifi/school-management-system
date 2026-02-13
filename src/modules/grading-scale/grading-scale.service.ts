import type { GradingScaleRepository } from './grading-scale.repository.ts';
import type { CreateGradingScaleInput, UpdateGradingScaleInput, ListGradingScalesQuery } from './grading-scale.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class GradingScaleService {
  private readonly repo: GradingScaleRepository;
  constructor(repo: GradingScaleRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListGradingScalesQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const scale = await this.repo.findById(id);
    if (!scale) throw new AppError('Grading scale not found', 404, 'GRADING_SCALE_NOT_FOUND');
    return scale;
  }

  async create(schoolId: string, input: CreateGradingScaleInput) {
    return this.repo.create(schoolId, input.name, input.levels);
  }

  async update(id: string, input: UpdateGradingScaleInput) {
    await this.getById(id);
    return this.repo.update(id, input.name, input.levels);
  }

  async remove(id: string) {
    await this.getById(id);

    const inUse = await this.repo.isUsedByExams(id);
    if (inUse) {
      throw new AppError('Cannot delete grading scale that is used by exams', 409, 'GRADING_SCALE_IN_USE');
    }

    await this.repo.delete(id);
  }
}
