import type { Request, Response } from 'express';
import type { FeePaymentService } from './fee-payment.service.ts';
import { createFeePaymentSchema, listFeePaymentsQuerySchema, idParamSchema } from './fee-payment.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';
import type { JwtPayload } from '../../shared/types/index.ts';

export class FeePaymentController {
  private readonly service: FeePaymentService;
  constructor(service: FeePaymentService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listFeePaymentsQuerySchema.parse(req.query);
    const schoolId = extractSchoolId(req);
    const result = await this.service.list(schoolId, query);
    res.json({
      success: true,
      data: result.data,
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    });
  };

  getById = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const payment = await this.service.getById(id);
    res.json({ success: true, data: payment });
  };

  create = async (req: Request, res: Response) => {
    const input = createFeePaymentSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const user = (req as unknown as Record<string, unknown>)['user'] as JwtPayload;
    const payment = await this.service.create(schoolId, user.sub, input);
    res.status(201).json({ success: true, data: payment });
  };
}
