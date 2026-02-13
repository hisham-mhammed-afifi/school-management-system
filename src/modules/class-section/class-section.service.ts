import type { ClassSectionRepository } from './class-section.repository.ts';
import type { CreateClassSectionInput, UpdateClassSectionInput, ListClassSectionsQuery } from './class-section.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class ClassSectionService {
  private readonly repo: ClassSectionRepository;
  constructor(repo: ClassSectionRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListClassSectionsQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const section = await this.repo.findById(id);
    if (!section) throw new AppError('Class section not found', 404, 'CLASS_SECTION_NOT_FOUND');
    return section;
  }

  async create(schoolId: string, input: CreateClassSectionInput) {
    return this.repo.create({ schoolId, ...input });
  }

  async update(id: string, input: UpdateClassSectionInput) {
    await this.getById(id);
    return this.repo.update(id, input);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repo.delete(id);
  }
}
