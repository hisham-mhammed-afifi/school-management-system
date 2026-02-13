import type { UserRepository } from './user.repository.ts';
import type { CreateUserInput, UpdateUserInput, AssignRoleInput, ListUsersQuery } from './user.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';
import { hashPassword } from '../../shared/utils/password.ts';

export class UserService {
  private readonly userRepo: UserRepository;
  constructor(userRepo: UserRepository) {
    this.userRepo = userRepo;
  }

  async list(schoolId: string | null, query: ListUsersQuery) {
    return this.userRepo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    return user;
  }

  async create(input: CreateUserInput, schoolId: string | null) {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) throw new AppError('Email already in use', 409, 'EMAIL_CONFLICT');

    const passwordHash = await hashPassword(input.password);

    const user = await this.userRepo.create({
      email: input.email,
      passwordHash,
      phone: input.phone,
      schoolId,
      teacherId: input.teacherId,
      studentId: input.studentId,
      guardianId: input.guardianId,
    });

    // Assign roles
    if (input.roleIds.length > 0) {
      await this.userRepo.createManyUserRoles(
        input.roleIds.map((roleId) => ({ userId: user.id, roleId, schoolId })),
      );
    }

    // Return with roles included
    return this.userRepo.findById(user.id);
  }

  async update(id: string, input: UpdateUserInput) {
    await this.getById(id);

    if (input.email) {
      const existing = await this.userRepo.findByEmail(input.email);
      if (existing && existing.id !== id) {
        throw new AppError('Email already in use', 409, 'EMAIL_CONFLICT');
      }
    }

    return this.userRepo.update(id, input);
  }

  async deactivate(id: string) {
    await this.getById(id);
    return this.userRepo.update(id, { isActive: false });
  }

  async assignRole(userId: string, input: AssignRoleInput) {
    await this.getById(userId);
    await this.userRepo.createUserRole(userId, input.roleId, input.schoolId ?? null);
    return this.userRepo.findById(userId);
  }

  async removeRole(userId: string, roleId: string, schoolId: string | null) {
    await this.getById(userId);
    const deleted = await this.userRepo.deleteUserRole(userId, roleId, schoolId);
    if (!deleted) throw new AppError('Role assignment not found', 404, 'ROLE_ASSIGNMENT_NOT_FOUND');
    return this.userRepo.findById(userId);
  }
}
