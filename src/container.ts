import { prisma } from './shared/database.ts';

// School
import { SchoolRepository } from './modules/school/school.repository.ts';
import { SchoolService } from './modules/school/school.service.ts';
import { SchoolController } from './modules/school/school.controller.ts';

// Auth
import { AuthService } from './modules/auth/auth.service.ts';
import { AuthController } from './modules/auth/auth.controller.ts';

// User
import { UserRepository } from './modules/user/user.repository.ts';
import { UserService } from './modules/user/user.service.ts';
import { UserController } from './modules/user/user.controller.ts';

// Role
import { RoleRepository } from './modules/role/role.repository.ts';
import { RoleService } from './modules/role/role.service.ts';
import { RoleController } from './modules/role/role.controller.ts';

export function createContainer() {
  // School
  const schoolRepo = new SchoolRepository(prisma);
  const schoolService = new SchoolService(schoolRepo);
  const schoolController = new SchoolController(schoolService);

  // Auth (uses prisma directly for complex joins)
  const authService = new AuthService(prisma);
  const authController = new AuthController(authService);

  // User
  const userRepo = new UserRepository(prisma);
  const userService = new UserService(userRepo);
  const userController = new UserController(userService);

  // Role
  const roleRepo = new RoleRepository(prisma);
  const roleService = new RoleService(roleRepo);
  const roleController = new RoleController(roleService);

  return {
    prisma,
    controllers: {
      schoolController,
      authController,
      userController,
      roleController,
    },
  } as const;
}
