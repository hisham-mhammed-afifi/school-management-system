import type { WorkingDayRepository } from './working-day.repository.ts';
import type { PeriodSetRepository } from '../period-set/period-set.repository.ts';
import type { ReplaceWorkingDaysInput } from './working-day.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class WorkingDayService {
  private readonly repo: WorkingDayRepository;
  private readonly periodSetRepo: PeriodSetRepository;
  constructor(repo: WorkingDayRepository, periodSetRepo: PeriodSetRepository) {
    this.repo = repo;
    this.periodSetRepo = periodSetRepo;
  }

  async listByPeriodSet(periodSetId: string) {
    await this.ensurePeriodSetExists(periodSetId);
    return this.repo.findByPeriodSet(periodSetId);
  }

  async replace(schoolId: string, periodSetId: string, input: ReplaceWorkingDaysInput) {
    await this.ensurePeriodSetExists(periodSetId);
    return this.repo.replaceAll(schoolId, periodSetId, input);
  }

  private async ensurePeriodSetExists(periodSetId: string) {
    const periodSet = await this.periodSetRepo.findById(periodSetId);
    if (!periodSet) throw new AppError('Period set not found', 404, 'PERIOD_SET_NOT_FOUND');
  }
}
