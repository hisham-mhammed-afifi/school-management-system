import type { Request, Response } from 'express';
import type { UserService } from './user.service.ts';
import {
  createUserSchema,
  updateUserSchema,
  assignRoleSchema,
  listUsersQuerySchema,
  idParamSchema,
  userRoleParamsSchema,
  removeRoleQuerySchema,
} from './user.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';
import type { JwtPayload } from '../../shared/types/index.ts';

export class UserController {
  private readonly userService: UserService;
  constructor(userService: UserService) {
    this.userService = userService;
  }

  list = async (req: Request, res: Response) => {
    const query = listUsersQuerySchema.parse(req.query);
    const user = (req as unknown as Record<string, unknown>)['user'] as JwtPayload;
    const schoolId = user.schoolId;
    const result = await this.userService.list(schoolId, query);
    res.json({
      success: true,
      data: result.data.map(formatUser),
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  };

  getById = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const user = await this.userService.getById(id);
    res.json({ success: true, data: formatUser(user) });
  };

  create = async (req: Request, res: Response) => {
    const input = createUserSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const user = await this.userService.create(input, schoolId);
    res.status(201).json({ success: true, data: user ? formatUser(user) : null });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateUserSchema.parse(req.body);
    const user = await this.userService.update(id, input);
    res.json({ success: true, data: formatUser(user) });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.userService.deactivate(id);
    res.status(204).send();
  };

  assignRole = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = assignRoleSchema.parse(req.body);
    const user = await this.userService.assignRole(id, input);
    res.json({ success: true, data: user ? formatUser(user) : null });
  };

  removeRole = async (req: Request, res: Response) => {
    const { id, roleId } = userRoleParamsSchema.parse(req.params);
    const { schoolId } = removeRoleQuerySchema.parse(req.query);
    const user = await this.userService.removeRole(id, roleId, schoolId ?? null);
    res.json({ success: true, data: user ? formatUser(user) : null });
  };
}

function formatUser(user: Record<string, unknown>) {
  const u = user as Record<string, unknown>;
  const userRoles = (u['userRoles'] as Array<Record<string, unknown>> | undefined) ?? [];
  return {
    id: u['id'],
    email: u['email'],
    phone: u['phone'],
    isActive: u['isActive'],
    lastLoginAt: u['lastLoginAt'],
    createdAt: u['createdAt'],
    updatedAt: u['updatedAt'],
    roles: userRoles.map((ur) => ({
      roleId: (ur['role'] as Record<string, unknown>)['id'],
      roleName: (ur['role'] as Record<string, unknown>)['name'],
      schoolId: ur['school'] ? (ur['school'] as Record<string, unknown>)['id'] : null,
      schoolName: ur['school'] ? (ur['school'] as Record<string, unknown>)['name'] : null,
    })),
  };
}
