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

// ---- All Permissions ----
const PERMISSIONS = [
  // Phase 1: Platform & Auth
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

  // Phase 2: Academic Structure
  { module: 'academic_years', action: 'view', name: 'academic_years.view' },
  { module: 'academic_years', action: 'create', name: 'academic_years.create' },
  { module: 'academic_years', action: 'update', name: 'academic_years.update' },
  { module: 'academic_years', action: 'delete', name: 'academic_years.delete' },
  { module: 'academic_years', action: 'activate', name: 'academic_years.activate' },
  { module: 'terms', action: 'view', name: 'terms.view' },
  { module: 'terms', action: 'create', name: 'terms.create' },
  { module: 'terms', action: 'update', name: 'terms.update' },
  { module: 'terms', action: 'delete', name: 'terms.delete' },
  { module: 'departments', action: 'view', name: 'departments.view' },
  { module: 'departments', action: 'create', name: 'departments.create' },
  { module: 'departments', action: 'update', name: 'departments.update' },
  { module: 'grades', action: 'view', name: 'grades.view' },
  { module: 'grades', action: 'create', name: 'grades.create' },
  { module: 'grades', action: 'update', name: 'grades.update' },
  { module: 'grades', action: 'delete', name: 'grades.delete' },
  { module: 'class_sections', action: 'view', name: 'class_sections.view' },
  { module: 'class_sections', action: 'create', name: 'class_sections.create' },
  { module: 'class_sections', action: 'update', name: 'class_sections.update' },
  { module: 'class_sections', action: 'delete', name: 'class_sections.delete' },
  { module: 'subjects', action: 'view', name: 'subjects.view' },
  { module: 'subjects', action: 'create', name: 'subjects.create' },
  { module: 'subjects', action: 'update', name: 'subjects.update' },
  { module: 'subjects', action: 'delete', name: 'subjects.delete' },
  { module: 'subjects', action: 'manage', name: 'subjects.manage' },
  { module: 'requirements', action: 'view', name: 'requirements.view' },
  { module: 'requirements', action: 'manage', name: 'requirements.manage' },

  // Phase 3: People
  { module: 'students', action: 'view', name: 'students.view' },
  { module: 'students', action: 'create', name: 'students.create' },
  { module: 'students', action: 'update', name: 'students.update' },
  { module: 'students', action: 'delete', name: 'students.delete' },
  { module: 'guardians', action: 'view', name: 'guardians.view' },
  { module: 'guardians', action: 'create', name: 'guardians.create' },
  { module: 'guardians', action: 'update', name: 'guardians.update' },
  { module: 'guardians', action: 'delete', name: 'guardians.delete' },
  { module: 'teachers', action: 'view', name: 'teachers.view' },
  { module: 'teachers', action: 'create', name: 'teachers.create' },
  { module: 'teachers', action: 'update', name: 'teachers.update' },
  { module: 'teachers', action: 'delete', name: 'teachers.delete' },
  { module: 'enrollments', action: 'view', name: 'enrollments.view' },
  { module: 'enrollments', action: 'create', name: 'enrollments.create' },
  { module: 'enrollments', action: 'update', name: 'enrollments.update' },
  { module: 'enrollments', action: 'delete', name: 'enrollments.delete' },

  // Phase 4: Scheduling
  { module: 'scheduling', action: 'view', name: 'scheduling.view' },
  { module: 'scheduling', action: 'manage', name: 'scheduling.manage' },
  { module: 'rooms', action: 'view', name: 'rooms.view' },
  { module: 'rooms', action: 'create', name: 'rooms.create' },
  { module: 'rooms', action: 'update', name: 'rooms.update' },
  { module: 'rooms', action: 'delete', name: 'rooms.delete' },
  { module: 'rooms', action: 'manage', name: 'rooms.manage' },
  { module: 'lessons', action: 'view', name: 'lessons.view' },
  { module: 'lessons', action: 'create', name: 'lessons.create' },
  { module: 'lessons', action: 'update', name: 'lessons.update' },
  { module: 'lessons', action: 'delete', name: 'lessons.delete' },
  { module: 'lessons', action: 'generate', name: 'lessons.generate' },
  { module: 'lessons', action: 'cancel', name: 'lessons.cancel' },
  { module: 'substitutions', action: 'view', name: 'substitutions.view' },
  { module: 'substitutions', action: 'create', name: 'substitutions.create' },
  { module: 'substitutions', action: 'update', name: 'substitutions.update' },
  { module: 'substitutions', action: 'delete', name: 'substitutions.delete' },
  { module: 'availability', action: 'view', name: 'availability.view' },
  { module: 'availability', action: 'manage', name: 'availability.manage' },

  // Phase 5: Attendance & Grading
  { module: 'attendance', action: 'view', name: 'attendance.view' },
  { module: 'attendance', action: 'record', name: 'attendance.record' },
  { module: 'attendance', action: 'correct', name: 'attendance.correct' },
  { module: 'grading', action: 'view', name: 'grading.view' },
  { module: 'grading', action: 'manage', name: 'grading.manage' },
  { module: 'grades_entry', action: 'view', name: 'grades_entry.view' },
  { module: 'grades_entry', action: 'record', name: 'grades_entry.record' },
  { module: 'grades_entry', action: 'update', name: 'grades_entry.update' },
  { module: 'grades_entry', action: 'publish', name: 'grades_entry.publish' },
  { module: 'exams', action: 'view', name: 'exams.view' },
  { module: 'exams', action: 'create', name: 'exams.create' },
  { module: 'exams', action: 'update', name: 'exams.update' },
  { module: 'exams', action: 'delete', name: 'exams.delete' },
  { module: 'exams', action: 'manage', name: 'exams.manage' },

  // Phase 6: Finance
  { module: 'fees', action: 'view', name: 'fees.view' },
  { module: 'fees', action: 'manage', name: 'fees.manage' },
  { module: 'fees', action: 'create_invoice', name: 'fees.create_invoice' },
  { module: 'fees', action: 'issue_invoice', name: 'fees.issue_invoice' },
  { module: 'fees', action: 'cancel_invoice', name: 'fees.cancel_invoice' },
  { module: 'fees', action: 'collect', name: 'fees.collect' },
  { module: 'fees', action: 'report', name: 'fees.report' },

  // Phase 7: Communication & Calendar
  { module: 'announcements', action: 'view', name: 'announcements.view' },
  { module: 'announcements', action: 'create', name: 'announcements.create' },
  { module: 'announcements', action: 'update', name: 'announcements.update' },
  { module: 'announcements', action: 'publish', name: 'announcements.publish' },
  { module: 'announcements', action: 'delete', name: 'announcements.delete' },
  { module: 'notifications', action: 'send', name: 'notifications.send' },
  { module: 'events', action: 'view', name: 'events.view' },
  { module: 'events', action: 'create', name: 'events.create' },
  { module: 'events', action: 'update', name: 'events.update' },
  { module: 'events', action: 'delete', name: 'events.delete' },
  { module: 'leaves', action: 'view', name: 'leaves.view' },
  { module: 'leaves', action: 'request', name: 'leaves.request' },
  { module: 'leaves', action: 'approve', name: 'leaves.approve' },

  // Audit
  { module: 'audit', action: 'view', name: 'audit.view' },
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

// ---- Role-Permission Matrix ----
const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: PERMISSIONS.map((p) => p.name),
  school_admin: PERMISSIONS.filter((p) => p.name !== 'platform.manage').map((p) => p.name),
  principal: [
    'school.view', 'dashboard.view', 'users.view', 'roles.view',
    'academic_years.view', 'terms.view', 'departments.view', 'grades.view',
    'class_sections.view', 'subjects.view', 'requirements.view',
    'students.view', 'guardians.view', 'teachers.view', 'enrollments.view',
    'scheduling.view', 'rooms.view', 'lessons.view', 'substitutions.view',
    'attendance.view', 'grading.view', 'grades_entry.view', 'exams.view',
    'fees.view', 'fees.report', 'announcements.view', 'announcements.create',
    'announcements.publish', 'events.view', 'events.create', 'leaves.view',
    'leaves.approve', 'audit.view',
  ],
  teacher: [
    'dashboard.view', 'academic_years.view', 'terms.view', 'grades.view',
    'class_sections.view', 'subjects.view', 'students.view',
    'lessons.view', 'attendance.view', 'attendance.record',
    'grades_entry.view', 'grades_entry.record', 'grades_entry.update',
    'announcements.view', 'leaves.view', 'leaves.request',
    'availability.view', 'availability.manage',
  ],
  student: ['dashboard.view', 'announcements.view', 'events.view'],
  guardian: ['dashboard.view', 'announcements.view', 'events.view', 'fees.view'],
  accountant: [
    'dashboard.view', 'fees.view', 'fees.manage', 'fees.create_invoice',
    'fees.issue_invoice', 'fees.cancel_invoice', 'fees.collect', 'fees.report',
    'students.view',
  ],
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
