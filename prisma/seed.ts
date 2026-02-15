import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { hashPassword } from '../src/shared/utils/password.ts';

// Environment variables are loaded via --env-file flag in package.json script
const DATABASE_URL = process.env['DATABASE_URL'];
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ---- Phase 1 Permissions ----
const PERMISSIONS = [
  { module: 'platform', action: 'manage', name: 'platform.manage' },
  { module: 'school', action: 'view', name: 'school.view' },
  { module: 'school', action: 'update', name: 'school.update' },
  { module: 'dashboard', action: 'view', name: 'dashboard.view' },
  { module: 'users', action: 'view', name: 'users.view' },
  { module: 'users', action: 'create', name: 'users.create' },
  { module: 'users', action: 'update', name: 'users.update' },
  { module: 'users', action: 'delete', name: 'users.delete' },
  { module: 'users', action: 'manage_roles', name: 'users.manage_roles' },
  { module: 'roles', action: 'view', name: 'roles.view' },
  { module: 'roles', action: 'create', name: 'roles.create' },
  { module: 'roles', action: 'update', name: 'roles.update' },
  { module: 'roles', action: 'delete', name: 'roles.delete' },
  { module: 'roles', action: 'manage_permissions', name: 'roles.manage_permissions' },
] as const;

// ---- Seed Roles (global) ----
const SEED_ROLES = [
  'super_admin',
  'school_admin',
  'principal',
  'teacher',
  'student',
  'guardian',
  'accountant',
] as const;

// ---- Role-Permission Matrix (Phase 1) ----
const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: PERMISSIONS.map((p) => p.name),
  school_admin: PERMISSIONS.filter((p) => p.name !== 'platform.manage').map((p) => p.name),
  principal: ['school.view', 'dashboard.view', 'users.view', 'roles.view'],
  teacher: ['dashboard.view'],
  student: ['dashboard.view'],
  guardian: ['dashboard.view'],
  accountant: ['dashboard.view'],
};

async function main() {
  console.log('Seeding Phase 1 data...');

  // 1. Upsert permissions
  const permissionMap = new Map<string, string>();
  for (const perm of PERMISSIONS) {
    const created = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
    permissionMap.set(created.name, created.id);
  }
  console.log(`  ${permissionMap.size} permissions upserted`);

  // 2. Upsert roles
  const roleMap = new Map<string, string>();
  for (const roleName of SEED_ROLES) {
    // Use findFirst + create/update since @@unique([schoolId, name]) with null schoolId
    let role = await prisma.role.findFirst({
      where: { name: roleName, schoolId: null },
    });
    if (!role) {
      role = await prisma.role.create({
        data: { name: roleName, schoolId: null },
      });
    }
    roleMap.set(role.name, role.id);
  }
  console.log(`  ${roleMap.size} roles upserted`);

  // 3. Assign permissions to roles
  let rpCount = 0;
  for (const [roleName, permNames] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleMap.get(roleName);
    if (!roleId) continue;

    for (const permName of permNames) {
      const permissionId = permissionMap.get(permName);
      if (!permissionId) continue;

      const exists = await prisma.rolePermission.findFirst({
        where: { roleId, permissionId },
      });
      if (!exists) {
        await prisma.rolePermission.create({ data: { roleId, permissionId } });
        rpCount++;
      }
    }
  }
  console.log(`  ${rpCount} role-permission mappings created`);

  // 4. Demo school
  const school = await prisma.school.upsert({
    where: { code: 'al-noor' },
    update: {},
    create: {
      name: 'Al Noor International Academy',
      code: 'al-noor',
      timezone: 'Asia/Riyadh',
      defaultLocale: 'ar',
      currency: 'SAR',
      country: 'Saudi Arabia',
      city: 'Riyadh',
      address: '123 King Fahd Road',
      phone: '+966501234567',
      email: 'info@alnoor.edu.sa',
      subscriptionPlan: 'premium',
      status: 'active',
    },
  });
  console.log(`  School: ${school.name} (${school.id})`);

  // 5. Super admin user
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@schoolms.com' },
    update: {},
    create: {
      email: 'superadmin@schoolms.com',
      passwordHash: await hashPassword('SuperAdmin123!'),
      schoolId: null,
      isActive: true,
    },
  });
  console.log(`  Super admin: ${superAdmin.email} (${superAdmin.id})`);

  // 6. School admin user
  const schoolAdmin = await prisma.user.upsert({
    where: { email: 'admin@alnoor.edu.sa' },
    update: {},
    create: {
      email: 'admin@alnoor.edu.sa',
      passwordHash: await hashPassword('Admin123!'),
      schoolId: school.id,
      isActive: true,
    },
  });
  console.log(`  School admin: ${schoolAdmin.email} (${schoolAdmin.id})`);

  // 7. Assign roles to users
  const superAdminRoleId = roleMap.get('super_admin')!;
  const schoolAdminRoleId = roleMap.get('school_admin')!;

  const existingSaRole = await prisma.userRole.findFirst({
    where: { userId: superAdmin.id, roleId: superAdminRoleId, schoolId: null },
  });
  if (!existingSaRole) {
    await prisma.userRole.create({
      data: { userId: superAdmin.id, roleId: superAdminRoleId, schoolId: null },
    });
  }

  const existingScaRole = await prisma.userRole.findFirst({
    where: { userId: schoolAdmin.id, roleId: schoolAdminRoleId, schoolId: school.id },
  });
  if (!existingScaRole) {
    await prisma.userRole.create({
      data: { userId: schoolAdmin.id, roleId: schoolAdminRoleId, schoolId: school.id },
    });
  }
  console.log('  User roles assigned');

  console.log('\nPhase 1 seed completed successfully!');
  console.log('\nTest credentials:');
  console.log('  Super Admin: superadmin@schoolms.com / SuperAdmin123!');
  console.log('  School Admin: admin@alnoor.edu.sa / Admin123!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
