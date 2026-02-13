import type { PeriodRepository } from './period.repository.ts';
import type { PeriodSetRepository } from '../period-set/period-set.repository.ts';
import type { ReplacePeriodsInput } from './period.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class PeriodService {
  private readonly repo: PeriodRepository;
  private readonly periodSetRepo: PeriodSetRepository;
  constructor(repo: PeriodRepository, periodSetRepo: PeriodSetRepository) {
    this.repo = repo;
    this.periodSetRepo = periodSetRepo;
  }

  async listByPeriodSet(periodSetId: string) {
    await this.ensurePeriodSetExists(periodSetId);
    return this.repo.findByPeriodSet(periodSetId);
  }

  async replace(schoolId: string, periodSetId: string, input: ReplacePeriodsInput) {
    await this.ensurePeriodSetExists(periodSetId);

    // Check for time overlaps between periods
    const sorted = [...input.periods].sort((a, b) => a.startTime.localeCompare(b.startTime));
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (prev && curr && curr.startTime < prev.endTime) {
        throw new AppError(
          `Period '${curr.name}' overlaps with '${prev.name}'`,
          422,
          'INVALID_PERIOD_OVERLAP',
        );
      }
    }

    return this.repo.replaceAll(schoolId, periodSetId, input);
  }

  private async ensurePeriodSetExists(periodSetId: string) {
    const periodSet = await this.periodSetRepo.findById(periodSetId);
    if (!periodSet) throw new AppError('Period set not found', 404, 'PERIOD_SET_NOT_FOUND');
  }
}
