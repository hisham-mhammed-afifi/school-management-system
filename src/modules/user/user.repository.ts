import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListUsersQuery } from './user.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

const USER_INCLUDE = {
  userRoles: {
    include: {
      role: true,
      school: true,
    },
  },
} as const;

export class UserRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findMany(schoolId: string | null, query: ListUsersQuery) {
    const { page, limit, search, sortBy, order, roleId, isActive } = query;
    const where: Prisma.UserWhereInput = {};

    // Tenant scoping: non-super-admin sees only their school's users
    if (schoolId !== null) {
      where.schoolId = schoolId;
    }

    if (search) {
      where.OR = [{ email: { contains: search, mode: 'insensitive' } }];
    }
    if (isActive !== undefined) where.isActive = isActive;
    if (roleId) {
      where.userRoles = { some: { roleId } };
    }

    const [data, total] = await Promise.all([
      this.db.user.findMany({
        where,
        include: USER_INCLUDE,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      this.db.user.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.user.findUnique({
      where: { id },
      include: USER_INCLUDE,
    });
  }

  async findByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    phone?: string;
    schoolId: string | null;
    teacherId?: string;
    studentId?: string;
    guardianId?: string;
  }) {
    return this.db.user.create({
      data,
      include: USER_INCLUDE,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.db.user.update({
      where: { id },
      data,
      include: USER_INCLUDE,
    });
  }

  async createUserRole(userId: string, roleId: string, schoolId: string | null) {
    return this.db.userRole.create({
      data: { userId, roleId, schoolId },
      include: { role: true, school: true },
    });
  }

  async deleteUserRole(userId: string, roleId: string, schoolId: string | null) {
    // Find and delete the specific user role
    const userRole = await this.db.userRole.findFirst({
      where: { userId, roleId, schoolId: schoolId ?? null },
    });
    if (!userRole) return null;
    return this.db.userRole.delete({ where: { id: userRole.id } });
  }

  async createManyUserRoles(entries: Array<{ userId: string; roleId: string; schoolId: string | null }>) {
    return this.db.userRole.createMany({ data: entries });
  }
}
