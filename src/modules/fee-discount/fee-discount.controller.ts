import type { Request, Response } from 'express';
import type { FeeDiscountService } from './fee-discount.service.ts';
import { createFeeDiscountSchema, updateFeeDiscountSchema, listFeeDiscountsQuerySchema, idParamSchema } from './fee-discount.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';
import type { JwtPayload } from '../../shared/types/index.ts';

export class FeeDiscountController {
  private readonly service: FeeDiscountService;
  constructor(service: FeeDiscountService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listFeeDiscountsQuerySchema.parse(req.query);
    const schoolId = extractSchoolId(req);
    const result = await this.service.list(schoolId, query);
    res.json({
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  };

  create = async (req: Request, res: Response) => {
    const input = createFeeDiscountSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const user = (req as unknown as Record<string, unknown>)['user'] as JwtPayload;
    const discount = await this.service.create(schoolId, user.sub, input);
    res.status(201).json({ success: true, data: discount });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateFeeDiscountSchema.parse(req.body);
    const discount = await this.service.update(id, input);
    res.json({ success: true, data: discount });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };
}
