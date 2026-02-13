import type { FeeStructureRepository } from './fee-structure.repository.ts';
import type { CreateFeeStructureInput, UpdateFeeStructureInput, ListFeeStructuresQuery } from './fee-structure.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class FeeStructureService {
  private readonly repo: FeeStructureRepository;
  constructor(repo: FeeStructureRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListFeeStructuresQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const structure = await this.repo.findById(id);
    if (!structure) throw new AppError('Fee structure not found', 404, 'FEE_STRUCTURE_NOT_FOUND');
    return structure;
  }

  async create(schoolId: string, input: CreateFeeStructureInput) {
    return this.repo.create({
      school: { connect: { id: schoolId } },
      academicYear: { connect: { id: input.academicYearId } },
      grade: { connect: { id: input.gradeId } },
      feeCategory: { connect: { id: input.feeCategoryId } },
      name: input.name,
      amount: input.amount,
      dueDate: input.dueDate ?? null,
      isRecurring: input.isRecurring,
      recurrence: input.recurrence ?? null,
    });
  }

  async update(id: string, input: UpdateFeeStructureInput) {
    await this.getById(id);
    const data: Record<string, unknown> = {};
    if (input.name !== undefined) data['name'] = input.name;
    if (input.amount !== undefined) data['amount'] = input.amount;
    if (input.dueDate !== undefined) data['dueDate'] = input.dueDate;
    if (input.isRecurring !== undefined) data['isRecurring'] = input.isRecurring;
    if (input.recurrence !== undefined) data['recurrence'] = input.recurrence;
    return this.repo.update(id, data);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repo.delete(id);
  }
}
