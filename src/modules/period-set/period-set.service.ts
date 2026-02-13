import type { PeriodSetRepository } from './period-set.repository.ts';
import type { CreatePeriodSetInput, UpdatePeriodSetInput, ListPeriodSetsQuery } from './period-set.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class PeriodSetService {
  private readonly repo: PeriodSetRepository;
  constructor(repo: PeriodSetRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListPeriodSetsQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const periodSet = await this.repo.findById(id);
    if (!periodSet) throw new AppError('Period set not found', 404, 'PERIOD_SET_NOT_FOUND');
    return periodSet;
  }

  async create(schoolId: string, input: CreatePeriodSetInput) {
    return this.repo.create({
      school: { connect: { id: schoolId } },
      academicYear: { connect: { id: input.academicYearId } },
      name: input.name,
    });
  }

  async update(id: string, input: UpdatePeriodSetInput) {
    await this.getById(id);
    return this.repo.update(id, { name: input.name });
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repo.delete(id);
  }
}
