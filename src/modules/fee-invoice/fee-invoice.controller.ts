import type { Request, Response } from 'express';
import type { FeeInvoiceService } from './fee-invoice.service.ts';
import {
  createFeeInvoiceSchema,
  bulkGenerateSchema,
  issueInvoiceSchema,
  cancelInvoiceSchema,
  listFeeInvoicesQuerySchema,
  idParamSchema,
} from './fee-invoice.schema.ts';
import { extractSchoolId } from '../../shared/middleware/auth.middleware.ts';

export class FeeInvoiceController {
  private readonly service: FeeInvoiceService;
  constructor(service: FeeInvoiceService) {
    this.service = service;
  }

  list = async (req: Request, res: Response) => {
    const query = listFeeInvoicesQuerySchema.parse(req.query);
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
    const invoice = await this.service.getById(id);
    res.json({ success: true, data: invoice });
  };

  create = async (req: Request, res: Response) => {
    const input = createFeeInvoiceSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const invoice = await this.service.create(schoolId, input);
    res.status(201).json({ success: true, data: invoice });
  };

  bulkGenerate = async (req: Request, res: Response) => {
    const input = bulkGenerateSchema.parse(req.body);
    const schoolId = extractSchoolId(req);
    const result = await this.service.bulkGenerate(schoolId, input);
    res.status(201).json({ success: true, data: result });
  };

  issue = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    issueInvoiceSchema.parse(req.body);
    const invoice = await this.service.issue(id);
    res.json({ success: true, data: invoice });
  };

  cancel = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = cancelInvoiceSchema.parse(req.body);
    const invoice = await this.service.cancel(id, input.reason);
    res.json({ success: true, data: invoice });
  };
}
