import type { TimeSlotRepository } from './time-slot.repository.ts';
import type { PeriodSetRepository } from '../period-set/period-set.repository.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class TimeSlotService {
  private readonly repo: TimeSlotRepository;
  private readonly periodSetRepo: PeriodSetRepository;
  constructor(repo: TimeSlotRepository, periodSetRepo: PeriodSetRepository) {
    this.repo = repo;
    this.periodSetRepo = periodSetRepo;
  }

  async listByPeriodSet(schoolId: string, periodSetId: string) {
    await this.ensurePeriodSetExists(periodSetId);
    return this.repo.findByPeriodSet(schoolId, periodSetId);
  }

  async generate(schoolId: string, periodSetId: string) {
    await this.ensurePeriodSetExists(periodSetId);
    return this.repo.generate(schoolId, periodSetId);
  }

  private async ensurePeriodSetExists(periodSetId: string) {
    const periodSet = await this.periodSetRepo.findById(periodSetId);
    if (!periodSet) throw new AppError('Period set not found', 404, 'PERIOD_SET_NOT_FOUND');
  }
}
