import type { FeeDiscountRepository } from './fee-discount.repository.ts';
import type { CreateFeeDiscountInput, UpdateFeeDiscountInput, ListFeeDiscountsQuery } from './fee-discount.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class FeeDiscountService {
  private readonly repo: FeeDiscountRepository;
  constructor(repo: FeeDiscountRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListFeeDiscountsQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const discount = await this.repo.findById(id);
    if (!discount) throw new AppError('Fee discount not found', 404, 'FEE_DISCOUNT_NOT_FOUND');
    return discount;
  }

  async create(schoolId: string, approvedBy: string, input: CreateFeeDiscountInput) {
    return this.repo.create({
      school: { connect: { id: schoolId } },
      student: { connect: { id: input.studentId } },
      feeStructure: { connect: { id: input.feeStructureId } },
      discountType: input.discountType,
      amount: input.amount,
      reason: input.reason ?? null,
      approvedByUser: { connect: { id: approvedBy } },
    });
  }

  async update(id: string, input: UpdateFeeDiscountInput) {
    await this.getById(id);
    const data: Record<string, unknown> = {};
    if (input.discountType !== undefined) data['discountType'] = input.discountType;
    if (input.amount !== undefined) data['amount'] = input.amount;
    if (input.reason !== undefined) data['reason'] = input.reason;
    return this.repo.update(id, data);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repo.delete(id);
  }
}
