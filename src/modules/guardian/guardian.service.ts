import type { GuardianRepository } from './guardian.repository.ts';
import type { CreateGuardianInput, UpdateGuardianInput, ListGuardiansQuery } from './guardian.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class GuardianService {
  private readonly repo: GuardianRepository;
  constructor(repo: GuardianRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListGuardiansQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const guardian = await this.repo.findById(id);
    if (!guardian) throw new AppError('Guardian not found', 404, 'GUARDIAN_NOT_FOUND');
    return guardian;
  }

  async create(schoolId: string, input: CreateGuardianInput) {
    return this.repo.create({
      school: { connect: { id: schoolId } },
      ...input,
    });
  }

  async update(id: string, input: UpdateGuardianInput) {
    await this.getById(id);
    return this.repo.update(id, input);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repo.softDelete(id);
  }
}
