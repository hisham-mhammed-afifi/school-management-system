import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListRolesQuery } from './role.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

const ROLE_INCLUDE = {
  rolePermissions: { include: { permission: true } },
  _count: { select: { userRoles: true } },
} as const;

export class RoleRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findMany(schoolId: string | null, query: ListRolesQuery) {
    const { page, limit, search } = query;
    const where: Prisma.RoleWhereInput = {
      OR: [
        { schoolId: null },  // global roles always visible
        ...(schoolId !== null ? [{ schoolId }] : []),
      ],
    };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.db.role.findMany({
        where,
        include: ROLE_INCLUDE,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.db.role.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.role.findUnique({
      where: { id },
      include: ROLE_INCLUDE,
    });
  }

  async findByNameAndSchool(name: string, schoolId: string | null) {
    return this.db.role.findFirst({
      where: { name, schoolId: schoolId ?? null },
    });
  }

  async create(name: string, schoolId: string | null) {
    return this.db.role.create({
      data: { name, schoolId },
      include: ROLE_INCLUDE,
    });
  }

  async update(id: string, name: string) {
    return this.db.role.update({
      where: { id },
      data: { name },
      include: ROLE_INCLUDE,
    });
  }

  async delete(id: string) {
    // Delete role permissions first, then role
    await this.db.rolePermission.deleteMany({ where: { roleId: id } });
    await this.db.userRole.deleteMany({ where: { roleId: id } });
    return this.db.role.delete({ where: { id } });
  }

  async setPermissions(roleId: string, permissionIds: string[]) {
    await this.db.rolePermission.deleteMany({ where: { roleId } });
    if (permissionIds.length > 0) {
      await this.db.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
      });
    }
    return this.findById(roleId);
  }

  async hasUsers(roleId: string): Promise<boolean> {
    const count = await this.db.userRole.count({ where: { roleId } });
    return count > 0;
  }
}
