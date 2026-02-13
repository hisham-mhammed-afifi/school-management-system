import type { RequirementRepository } from './requirement.repository.ts';
import type { SetRequirementsInput } from './requirement.schema.ts';
import type { ClassSectionRepository } from '../class-section/class-section.repository.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class RequirementService {
  private readonly repo: RequirementRepository;
  private readonly sectionRepo: ClassSectionRepository;
  constructor(repo: RequirementRepository, sectionRepo: ClassSectionRepository) {
    this.repo = repo;
    this.sectionRepo = sectionRepo;
  }

  async getBySectionId(sectionId: string) {
    await this.ensureSectionExists(sectionId);
    return this.repo.findBySectionId(sectionId);
  }

  async setForSection(sectionId: string, input: SetRequirementsInput) {
    const section = await this.ensureSectionExists(sectionId);
    return this.repo.replaceForSection(
      section.schoolId,
      section.academicYearId,
      sectionId,
      input.requirements,
    );
  }

  private async ensureSectionExists(sectionId: string) {
    const section = await this.sectionRepo.findById(sectionId);
    if (!section) throw new AppError('Class section not found', 404, 'CLASS_SECTION_NOT_FOUND');
    return section;
  }
}
