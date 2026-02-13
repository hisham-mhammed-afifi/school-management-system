import type { TeacherAvailabilityRepository } from './teacher-availability.repository.ts';
import type { ReplaceAvailabilityInput } from './teacher-availability.schema.ts';

export class TeacherAvailabilityService {
  private readonly repo: TeacherAvailabilityRepository;
  constructor(repo: TeacherAvailabilityRepository) {
    this.repo = repo;
  }

  async getByTeacher(teacherId: string) {
    return this.repo.findByTeacher(teacherId);
  }

  async replace(schoolId: string, teacherId: string, input: ReplaceAvailabilityInput) {
    return this.repo.replaceAll(schoolId, teacherId, input);
  }
}
