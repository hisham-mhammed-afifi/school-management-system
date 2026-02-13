import type { RoleRepository } from './role.repository.ts';
import type { CreateRoleInput, UpdateRoleInput, SetRolePermissionsInput, ListRolesQuery } from './role.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

const SEED_ROLES = ['super_admin', 'school_admin', 'principal', 'teacher', 'student', 'guardian', 'accountant'];

export class RoleService {
  private readonly roleRepo: RoleRepository;
  constructor(roleRepo: RoleRepository) {
    this.roleRepo = roleRepo;
  }

  async list(schoolId: string | null, query: ListRolesQuery) {
    const result = await this.roleRepo.findMany(schoolId, query);
    return {
      ...result,
      data: result.data.map(formatRole),
    };
  }

  async getById(id: string) {
    const role = await this.roleRepo.findById(id);
    if (!role) throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');
    return formatRoleWithPermissions(role);
  }

  async create(input: CreateRoleInput, schoolId: string) {
    if (SEED_ROLES.includes(input.name)) {
      throw new AppError('Cannot create a role with a reserved name', 409, 'ROLE_NAME_EXISTS');
    }

    const existing = await this.roleRepo.findByNameAndSchool(input.name, schoolId);
    if (existing) throw new AppError('Role name already exists in this school', 409, 'ROLE_NAME_EXISTS');

    const role = await this.roleRepo.create(input.name, schoolId);
    return formatRole(role);
  }

  async update(id: string, input: UpdateRoleInput) {
    const role = await this.roleRepo.findById(id);
    if (!role) throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');

    if (role.schoolId === null) {
      throw new AppError('Cannot modify seed roles', 403, 'SEED_ROLE_PROTECTED');
    }

    if (input.name !== role.name) {
      const existing = await this.roleRepo.findByNameAndSchool(input.name, role.schoolId);
      if (existing && existing.id !== id) {
        throw new AppError('Role name already exists in this school', 409, 'ROLE_NAME_EXISTS');
      }
    }

    const updated = await this.roleRepo.update(id, input.name);
    return formatRole(updated);
  }

  async remove(id: string) {
    const role = await this.roleRepo.findById(id);
    if (!role) throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');

    if (role.schoolId === null) {
      throw new AppError('Cannot delete seed roles', 403, 'SEED_ROLE_PROTECTED');
    }

    const inUse = await this.roleRepo.hasUsers(id);
    if (inUse) {
      throw new AppError('Role is assigned to users and cannot be deleted', 409, 'ROLE_IN_USE');
    }

    await this.roleRepo.delete(id);
  }

  async setPermissions(id: string, input: SetRolePermissionsInput) {
    const role = await this.roleRepo.findById(id);
    if (!role) throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');

    const updated = await this.roleRepo.setPermissions(id, input.permissionIds);
    if (!updated) throw new AppError('Role not found', 404, 'ROLE_NOT_FOUND');
    return formatRoleWithPermissions(updated);
  }
}

function formatRole(role: Record<string, unknown>) {
  const r = role as Record<string, unknown>;
  const count = r['_count'] as Record<string, number> | undefined;
  const rolePermissions = (r['rolePermissions'] as unknown[]) ?? [];
  return {
    id: r['id'],
    name: r['name'],
    schoolId: r['schoolId'] ?? null,
    isGlobal: r['schoolId'] === null,
    permissionCount: rolePermissions.length,
    userCount: count?.['userRoles'] ?? 0,
  };
}

function formatRoleWithPermissions(role: Record<string, unknown>) {
  const r = role as Record<string, unknown>;
  const rolePermissions = (r['rolePermissions'] as Array<Record<string, unknown>>) ?? [];
  return {
    id: r['id'],
    name: r['name'],
    schoolId: r['schoolId'] ?? null,
    isGlobal: r['schoolId'] === null,
    permissions: rolePermissions.map((rp) => {
      const perm = rp['permission'] as Record<string, unknown>;
      return {
        id: perm['id'],
        name: perm['name'],
        module: perm['module'],
        action: perm['action'],
      };
    }),
  };
}
