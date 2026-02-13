import type { DepartmentRepository } from './department.repository.ts';
import type { CreateDepartmentInput, UpdateDepartmentInput, ListDepartmentsQuery } from './department.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class DepartmentService {
  private readonly repo: DepartmentRepository;
  constructor(repo: DepartmentRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListDepartmentsQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const dept = await this.repo.findById(id);
    if (!dept) throw new AppError('Department not found', 404, 'DEPARTMENT_NOT_FOUND');
    return dept;
  }

  async create(schoolId: string, input: CreateDepartmentInput) {
    return this.repo.create({ schoolId, ...input });
  }

  async update(id: string, input: UpdateDepartmentInput) {
    await this.getById(id);
    return this.repo.update(id, input);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repo.delete(id);
  }
}
