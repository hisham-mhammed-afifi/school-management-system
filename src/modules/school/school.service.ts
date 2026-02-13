import type { SchoolRepository } from './school.repository.ts';
import type { CreateSchoolInput, UpdateSchoolInput, UpdateSchoolProfileInput, ListSchoolsQuery } from './school.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  active: ['suspended', 'archived'],
  suspended: ['active', 'archived'],
  archived: [],
};

export class SchoolService {
  private readonly schoolRepo: SchoolRepository;
  constructor(schoolRepo: SchoolRepository) {
    this.schoolRepo = schoolRepo;
  }

  async list(query: ListSchoolsQuery) {
    return this.schoolRepo.findMany(query);
  }

  async getById(id: string) {
    const school = await this.schoolRepo.findById(id);
    if (!school) throw new AppError('School not found', 404, 'SCHOOL_NOT_FOUND');
    return school;
  }

  async create(input: CreateSchoolInput) {
    const existing = await this.schoolRepo.findByCode(input.code);
    if (existing) throw new AppError('School code already exists', 409, 'SCHOOL_CODE_EXISTS');
    return this.schoolRepo.create(input);
  }

  async update(id: string, input: UpdateSchoolInput) {
    const school = await this.getById(id);

    if (input.status) {
      const allowed = VALID_STATUS_TRANSITIONS[school.status] ?? [];
      if (!allowed.includes(input.status)) {
        throw new AppError(
          `Cannot transition from '${school.status}' to '${input.status}'`,
          422,
          'INVALID_STATUS_TRANSITION',
        );
      }
    }

    return this.schoolRepo.update(id, input);
  }

  async suspend(id: string) {
    return this.update(id, { status: 'suspended' });
  }

  async reactivate(id: string) {
    return this.update(id, { status: 'active' });
  }

  async getProfile(schoolId: string) {
    return this.getById(schoolId);
  }

  async updateProfile(schoolId: string, input: UpdateSchoolProfileInput) {
    await this.getById(schoolId);
    return this.schoolRepo.update(schoolId, input);
  }
}
