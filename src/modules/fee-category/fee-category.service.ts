import type { FeeCategoryRepository } from './fee-category.repository.ts';
import type { CreateFeeCategoryInput, UpdateFeeCategoryInput, ListFeeCategoriesQuery } from './fee-category.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class FeeCategoryService {
  private readonly repo: FeeCategoryRepository;
  constructor(repo: FeeCategoryRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListFeeCategoriesQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const category = await this.repo.findById(id);
    if (!category) throw new AppError('Fee category not found', 404, 'FEE_CATEGORY_NOT_FOUND');
    return category;
  }

  async create(schoolId: string, input: CreateFeeCategoryInput) {
    return this.repo.create({
      school: { connect: { id: schoolId } },
      name: input.name,
    });
  }

  async update(id: string, input: UpdateFeeCategoryInput) {
    await this.getById(id);
    return this.repo.update(id, input);
  }

  async remove(id: string) {
    await this.getById(id);
    const hasStructures = await this.repo.hasStructures(id);
    if (hasStructures) {
      throw new AppError('Cannot delete fee category that has fee structures', 409, 'FEE_CATEGORY_IN_USE');
    }
    await this.repo.delete(id);
  }
}
