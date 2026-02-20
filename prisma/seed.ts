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
// Names follow the convention: {module-name}.{action}
// Module names use hyphens. Actions: list, create, read, update, delete (+ domain-specific).
const PERMISSIONS = [
  // Phase 1: Platform & Auth
  { module: 'platform', action: 'manage', name: 'platform.manage' },
  { module: 'school', action: 'read', name: 'school.read' },
  { module: 'school', action: 'update', name: 'school.update' },
  { module: 'dashboard', action: 'read', name: 'dashboard.read' },
  { module: 'users', action: 'list', name: 'users.list' },
  { module: 'users', action: 'create', name: 'users.create' },
  { module: 'users', action: 'read', name: 'users.read' },
  { module: 'users', action: 'update', name: 'users.update' },
  { module: 'users', action: 'delete', name: 'users.delete' },
  { module: 'users', action: 'manage-roles', name: 'users.manage-roles' },
  { module: 'roles', action: 'list', name: 'roles.list' },
  { module: 'roles', action: 'create', name: 'roles.create' },
  { module: 'roles', action: 'read', name: 'roles.read' },
  { module: 'roles', action: 'update', name: 'roles.update' },
  { module: 'roles', action: 'delete', name: 'roles.delete' },
  { module: 'roles', action: 'manage-permissions', name: 'roles.manage-permissions' },

  // Phase 2: Academic Structure
  { module: 'academic-years', action: 'list', name: 'academic-years.list' },
  { module: 'academic-years', action: 'create', name: 'academic-years.create' },
  { module: 'academic-years', action: 'read', name: 'academic-years.read' },
  { module: 'academic-years', action: 'update', name: 'academic-years.update' },
  { module: 'academic-years', action: 'delete', name: 'academic-years.delete' },
  { module: 'academic-years', action: 'activate', name: 'academic-years.activate' },
  { module: 'terms', action: 'list', name: 'terms.list' },
  { module: 'terms', action: 'create', name: 'terms.create' },
  { module: 'terms', action: 'update', name: 'terms.update' },
  { module: 'terms', action: 'delete', name: 'terms.delete' },
  { module: 'departments', action: 'list', name: 'departments.list' },
  { module: 'departments', action: 'create', name: 'departments.create' },
  { module: 'departments', action: 'read', name: 'departments.read' },
  { module: 'departments', action: 'update', name: 'departments.update' },
  { module: 'departments', action: 'delete', name: 'departments.delete' },
  { module: 'grades', action: 'list', name: 'grades.list' },
  { module: 'grades', action: 'create', name: 'grades.create' },
  { module: 'grades', action: 'read', name: 'grades.read' },
  { module: 'grades', action: 'update', name: 'grades.update' },
  { module: 'grades', action: 'delete', name: 'grades.delete' },
  { module: 'class-sections', action: 'list', name: 'class-sections.list' },
  { module: 'class-sections', action: 'create', name: 'class-sections.create' },
  { module: 'class-sections', action: 'read', name: 'class-sections.read' },
  { module: 'class-sections', action: 'update', name: 'class-sections.update' },
  { module: 'class-sections', action: 'delete', name: 'class-sections.delete' },
  { module: 'subjects', action: 'list', name: 'subjects.list' },
  { module: 'subjects', action: 'create', name: 'subjects.create' },
  { module: 'subjects', action: 'read', name: 'subjects.read' },
  { module: 'subjects', action: 'update', name: 'subjects.update' },
  { module: 'subjects', action: 'delete', name: 'subjects.delete' },
  { module: 'requirements', action: 'list', name: 'requirements.list' },
  { module: 'requirements', action: 'update', name: 'requirements.update' },

  // Phase 3: People
  { module: 'students', action: 'list', name: 'students.list' },
  { module: 'students', action: 'create', name: 'students.create' },
  { module: 'students', action: 'read', name: 'students.read' },
  { module: 'students', action: 'update', name: 'students.update' },
  { module: 'students', action: 'delete', name: 'students.delete' },
  { module: 'guardians', action: 'list', name: 'guardians.list' },
  { module: 'guardians', action: 'create', name: 'guardians.create' },
  { module: 'guardians', action: 'read', name: 'guardians.read' },
  { module: 'guardians', action: 'update', name: 'guardians.update' },
  { module: 'guardians', action: 'delete', name: 'guardians.delete' },
  { module: 'teachers', action: 'list', name: 'teachers.list' },
  { module: 'teachers', action: 'create', name: 'teachers.create' },
  { module: 'teachers', action: 'read', name: 'teachers.read' },
  { module: 'teachers', action: 'update', name: 'teachers.update' },
  { module: 'teachers', action: 'delete', name: 'teachers.delete' },
  { module: 'enrollments', action: 'list', name: 'enrollments.list' },
  { module: 'enrollments', action: 'create', name: 'enrollments.create' },
  { module: 'enrollments', action: 'read', name: 'enrollments.read' },
  { module: 'enrollments', action: 'update', name: 'enrollments.update' },
  { module: 'enrollments', action: 'delete', name: 'enrollments.delete' },
  { module: 'student-guardians', action: 'list', name: 'student-guardians.list' },
  { module: 'student-guardians', action: 'create', name: 'student-guardians.create' },
  { module: 'student-guardians', action: 'update', name: 'student-guardians.update' },
  { module: 'student-guardians', action: 'delete', name: 'student-guardians.delete' },

  // Phase 4: Time & Space
  { module: 'period-sets', action: 'list', name: 'period-sets.list' },
  { module: 'period-sets', action: 'create', name: 'period-sets.create' },
  { module: 'period-sets', action: 'read', name: 'period-sets.read' },
  { module: 'period-sets', action: 'update', name: 'period-sets.update' },
  { module: 'period-sets', action: 'delete', name: 'period-sets.delete' },
  { module: 'periods', action: 'list', name: 'periods.list' },
  { module: 'periods', action: 'update', name: 'periods.update' },
  { module: 'time-slots', action: 'list', name: 'time-slots.list' },
  { module: 'time-slots', action: 'create', name: 'time-slots.create' },
  { module: 'working-days', action: 'list', name: 'working-days.list' },
  { module: 'working-days', action: 'update', name: 'working-days.update' },
  { module: 'rooms', action: 'list', name: 'rooms.list' },
  { module: 'rooms', action: 'create', name: 'rooms.create' },
  { module: 'rooms', action: 'read', name: 'rooms.read' },
  { module: 'rooms', action: 'update', name: 'rooms.update' },
  { module: 'rooms', action: 'delete', name: 'rooms.delete' },

  // Phase 5: Scheduling
  { module: 'lessons', action: 'list', name: 'lessons.list' },
  { module: 'lessons', action: 'create', name: 'lessons.create' },
  { module: 'lessons', action: 'read', name: 'lessons.read' },
  { module: 'lessons', action: 'update', name: 'lessons.update' },
  { module: 'lessons', action: 'delete', name: 'lessons.delete' },
  { module: 'lessons', action: 'generate', name: 'lessons.generate' },
  { module: 'lessons', action: 'cancel', name: 'lessons.cancel' },
  { module: 'substitutions', action: 'list', name: 'substitutions.list' },
  { module: 'substitutions', action: 'create', name: 'substitutions.create' },
  { module: 'substitutions', action: 'read', name: 'substitutions.read' },
  { module: 'substitutions', action: 'update', name: 'substitutions.update' },
  { module: 'substitutions', action: 'delete', name: 'substitutions.delete' },
  { module: 'teacher-availability', action: 'list', name: 'teacher-availability.list' },
  { module: 'teacher-availability', action: 'update', name: 'teacher-availability.update' },

  // Phase 6: Daily Operations
  { module: 'student-attendance', action: 'list', name: 'student-attendance.list' },
  { module: 'student-attendance', action: 'create', name: 'student-attendance.create' },
  { module: 'student-attendance', action: 'read', name: 'student-attendance.read' },
  { module: 'student-attendance', action: 'update', name: 'student-attendance.update' },
  { module: 'teacher-attendance', action: 'list', name: 'teacher-attendance.list' },
  { module: 'teacher-attendance', action: 'create', name: 'teacher-attendance.create' },
  { module: 'teacher-attendance', action: 'read', name: 'teacher-attendance.read' },
  { module: 'teacher-attendance', action: 'update', name: 'teacher-attendance.update' },
  { module: 'teacher-leaves', action: 'list', name: 'teacher-leaves.list' },
  { module: 'teacher-leaves', action: 'create', name: 'teacher-leaves.create' },
  { module: 'teacher-leaves', action: 'read', name: 'teacher-leaves.read' },
  { module: 'teacher-leaves', action: 'approve', name: 'teacher-leaves.approve' },

  // Phase 7: Assessment
  { module: 'grading-scales', action: 'list', name: 'grading-scales.list' },
  { module: 'grading-scales', action: 'create', name: 'grading-scales.create' },
  { module: 'grading-scales', action: 'read', name: 'grading-scales.read' },
  { module: 'grading-scales', action: 'update', name: 'grading-scales.update' },
  { module: 'grading-scales', action: 'delete', name: 'grading-scales.delete' },
  { module: 'exams', action: 'list', name: 'exams.list' },
  { module: 'exams', action: 'create', name: 'exams.create' },
  { module: 'exams', action: 'read', name: 'exams.read' },
  { module: 'exams', action: 'update', name: 'exams.update' },
  { module: 'exams', action: 'delete', name: 'exams.delete' },
  { module: 'exam-subjects', action: 'list', name: 'exam-subjects.list' },
  { module: 'exam-subjects', action: 'create', name: 'exam-subjects.create' },
  { module: 'exam-subjects', action: 'update', name: 'exam-subjects.update' },
  { module: 'exam-subjects', action: 'delete', name: 'exam-subjects.delete' },
  { module: 'student-grades', action: 'list', name: 'student-grades.list' },
  { module: 'student-grades', action: 'create', name: 'student-grades.create' },
  { module: 'student-grades', action: 'update', name: 'student-grades.update' },
  { module: 'report-cards', action: 'list', name: 'report-cards.list' },
  { module: 'report-cards', action: 'create', name: 'report-cards.create' },
  { module: 'report-cards', action: 'read', name: 'report-cards.read' },
  { module: 'report-cards', action: 'update', name: 'report-cards.update' },

  // Phase 8: Finance
  { module: 'fee-categories', action: 'list', name: 'fee-categories.list' },
  { module: 'fee-categories', action: 'create', name: 'fee-categories.create' },
  { module: 'fee-categories', action: 'update', name: 'fee-categories.update' },
  { module: 'fee-categories', action: 'delete', name: 'fee-categories.delete' },
  { module: 'fee-structures', action: 'list', name: 'fee-structures.list' },
  { module: 'fee-structures', action: 'create', name: 'fee-structures.create' },
  { module: 'fee-structures', action: 'update', name: 'fee-structures.update' },
  { module: 'fee-structures', action: 'delete', name: 'fee-structures.delete' },
  { module: 'fee-discounts', action: 'list', name: 'fee-discounts.list' },
  { module: 'fee-discounts', action: 'create', name: 'fee-discounts.create' },
  { module: 'fee-discounts', action: 'update', name: 'fee-discounts.update' },
  { module: 'fee-discounts', action: 'delete', name: 'fee-discounts.delete' },
  { module: 'fee-invoices', action: 'list', name: 'fee-invoices.list' },
  { module: 'fee-invoices', action: 'create', name: 'fee-invoices.create' },
  { module: 'fee-invoices', action: 'read', name: 'fee-invoices.read' },
  { module: 'fee-invoices', action: 'update', name: 'fee-invoices.update' },
  { module: 'fee-payments', action: 'list', name: 'fee-payments.list' },
  { module: 'fee-payments', action: 'create', name: 'fee-payments.create' },
  { module: 'fee-payments', action: 'read', name: 'fee-payments.read' },
  { module: 'financial-reports', action: 'read', name: 'financial-reports.read' },

  // Phase 9: Communication
  { module: 'announcements', action: 'list', name: 'announcements.list' },
  { module: 'announcements', action: 'create', name: 'announcements.create' },
  { module: 'announcements', action: 'read', name: 'announcements.read' },
  { module: 'announcements', action: 'update', name: 'announcements.update' },
  { module: 'announcements', action: 'publish', name: 'announcements.publish' },
  { module: 'announcements', action: 'delete', name: 'announcements.delete' },
  { module: 'notifications', action: 'create', name: 'notifications.create' },
  { module: 'academic-events', action: 'list', name: 'academic-events.list' },
  { module: 'academic-events', action: 'create', name: 'academic-events.create' },
  { module: 'academic-events', action: 'read', name: 'academic-events.read' },
  { module: 'academic-events', action: 'update', name: 'academic-events.update' },
  { module: 'academic-events', action: 'delete', name: 'academic-events.delete' },

  // Phase 10: Audit
  { module: 'audit-logs', action: 'list', name: 'audit-logs.list' },
  { module: 'audit-logs', action: 'read', name: 'audit-logs.read' },
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
    'school.read', 'dashboard.read', 'users.list', 'users.read', 'roles.list', 'roles.read',
    'academic-years.list', 'academic-years.read', 'terms.list',
    'departments.list', 'departments.read', 'grades.list', 'grades.read',
    'class-sections.list', 'class-sections.read', 'subjects.list', 'subjects.read',
    'requirements.list',
    'students.list', 'students.read', 'guardians.list', 'guardians.read',
    'teachers.list', 'teachers.read', 'enrollments.list', 'enrollments.read',
    'student-guardians.list',
    'period-sets.list', 'period-sets.read', 'rooms.list', 'rooms.read',
    'lessons.list', 'lessons.read', 'substitutions.list', 'substitutions.read',
    'student-attendance.list', 'student-attendance.read',
    'teacher-attendance.list', 'teacher-attendance.read',
    'grading-scales.list', 'grading-scales.read',
    'exams.list', 'exams.read', 'exam-subjects.list',
    'student-grades.list', 'report-cards.list', 'report-cards.read',
    'fee-invoices.list', 'fee-invoices.read', 'fee-payments.list', 'fee-payments.read',
    'financial-reports.read',
    'announcements.list', 'announcements.read', 'announcements.create', 'announcements.publish',
    'academic-events.list', 'academic-events.read', 'academic-events.create',
    'teacher-leaves.list', 'teacher-leaves.read', 'teacher-leaves.approve',
    'audit-logs.list', 'audit-logs.read',
  ],
  teacher: [
    'dashboard.read',
    'academic-years.list', 'terms.list', 'grades.list',
    'class-sections.list', 'subjects.list', 'students.list', 'students.read',
    'lessons.list', 'lessons.read',
    'student-attendance.list', 'student-attendance.create',
    'student-attendance.read', 'student-attendance.update',
    'teacher-attendance.list', 'teacher-attendance.read',
    'student-grades.list', 'student-grades.create', 'student-grades.update',
    'announcements.list', 'announcements.read',
    'teacher-leaves.list', 'teacher-leaves.read', 'teacher-leaves.create',
    'teacher-availability.list', 'teacher-availability.update',
  ],
  student: ['dashboard.read', 'announcements.list', 'announcements.read',
    'academic-events.list', 'academic-events.read'],
  guardian: ['dashboard.read', 'announcements.list', 'announcements.read',
    'academic-events.list', 'academic-events.read',
    'fee-invoices.list', 'fee-invoices.read', 'fee-payments.list', 'fee-payments.read'],
  accountant: [
    'dashboard.read', 'students.list', 'students.read',
    'fee-categories.list', 'fee-categories.create', 'fee-categories.update', 'fee-categories.delete',
    'fee-structures.list', 'fee-structures.create', 'fee-structures.update', 'fee-structures.delete',
    'fee-discounts.list', 'fee-discounts.create', 'fee-discounts.update', 'fee-discounts.delete',
    'fee-invoices.list', 'fee-invoices.create', 'fee-invoices.read', 'fee-invoices.update',
    'fee-payments.list', 'fee-payments.create', 'fee-payments.read',
    'financial-reports.read',
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
