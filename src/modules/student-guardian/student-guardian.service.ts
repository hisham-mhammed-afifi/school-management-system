import type { StudentGuardianRepository } from './student-guardian.repository.ts';
import type { CreateStudentGuardianInput, UpdateStudentGuardianInput } from './student-guardian.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class StudentGuardianService {
  private readonly repo: StudentGuardianRepository;
  constructor(repo: StudentGuardianRepository) {
    this.repo = repo;
  }

  async listByStudent(studentId: string) {
    return this.repo.findByStudent(studentId);
  }

  async getById(id: string) {
    const link = await this.repo.findById(id);
    if (!link) throw new AppError('Student-guardian link not found', 404, 'STUDENT_GUARDIAN_NOT_FOUND');
    return link;
  }

  async create(schoolId: string, studentId: string, input: CreateStudentGuardianInput) {
    return this.repo.create({
      school: { connect: { id: schoolId } },
      student: { connect: { id: studentId } },
      guardian: { connect: { id: input.guardianId } },
      relationshipType: input.relationshipType,
      isPrimary: input.isPrimary,
      isEmergencyContact: input.isEmergencyContact,
    });
  }

  async update(id: string, input: UpdateStudentGuardianInput) {
    await this.getById(id);
    return this.repo.update(id, input);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repo.delete(id);
  }
}
