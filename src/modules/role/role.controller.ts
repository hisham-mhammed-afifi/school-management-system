import type { Request, Response } from 'express';
import type { RoleService } from './role.service.ts';
import {
  createRoleSchema,
  updateRoleSchema,
  setRolePermissionsSchema,
  listRolesQuerySchema,
  idParamSchema,
} from './role.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';
import type { JwtPayload } from '../../shared/types/index.ts';

export class RoleController {
  private readonly roleService: RoleService;
  constructor(roleService: RoleService) {
    this.roleService = roleService;
  }

  list = async (req: Request, res: Response) => {
    const query = listRolesQuerySchema.parse(req.query);
    const user = (req as unknown as Record<string, unknown>)['user'] as JwtPayload;
    const result = await this.roleService.list(user.schoolId, query);
    res.json({
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  };

  getById = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const role = await this.roleService.getById(id);
    res.json({ success: true, data: role });
  };

  create = async (req: Request, res: Response) => {
    const input = createRoleSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const role = await this.roleService.create(input, schoolId);
    res.status(201).json({ success: true, data: role });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateRoleSchema.parse(req.body);
    const role = await this.roleService.update(id, input);
    res.json({ success: true, data: role });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.roleService.remove(id);
    res.status(204).send();
  };

  setPermissions = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = setRolePermissionsSchema.parse(req.body);
    const role = await this.roleService.setPermissions(id, input);
    res.json({ success: true, data: role });
  };
}
