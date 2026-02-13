import type { FeeInvoiceRepository } from './fee-invoice.repository.ts';
import type { CreateFeeInvoiceInput, BulkGenerateInput, ListFeeInvoicesQuery } from './fee-invoice.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class FeeInvoiceService {
  private readonly repo: FeeInvoiceRepository;
  constructor(repo: FeeInvoiceRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListFeeInvoicesQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const invoice = await this.repo.findById(id);
    if (!invoice) throw new AppError('Fee invoice not found', 404, 'FEE_INVOICE_NOT_FOUND');
    return invoice;
  }

  async create(schoolId: string, input: CreateFeeInvoiceInput) {
    const invoiceNumber = await this.repo.getNextInvoiceNumber(schoolId);

    // Compute item totals
    const items = input.items.map((item) => ({
      feeStructureId: item.feeStructureId,
      description: item.description,
      quantity: item.quantity,
      unitAmount: item.unitAmount,
      totalAmount: item.quantity * item.unitAmount,
    }));

    const totalAmount = items.reduce((sum, i) => sum + i.totalAmount, 0);

    // Load applicable discounts
    const feeStructureIds = items.map((i) => i.feeStructureId);
    const discounts = await this.repo.getDiscountsForStudent(schoolId, input.studentId, feeStructureIds);

    let discountAmount = 0;
    for (const discount of discounts) {
      const item = items.find((i) => i.feeStructureId === discount.feeStructureId);
      if (!item) continue;

      const discountType = discount.discountType;
      const discountVal = Number(discount.amount.toString());

      if (discountType === 'percentage') {
        discountAmount += Math.min(item.totalAmount, item.totalAmount * (discountVal / 100));
      } else {
        discountAmount += Math.min(item.totalAmount, discountVal);
      }
    }

    discountAmount = Math.round(discountAmount * 100) / 100;
    const netAmount = Math.round((totalAmount - discountAmount) * 100) / 100;

    if (netAmount < 0) {
      throw new AppError('Total discount exceeds invoice total', 422, 'DISCOUNT_EXCEEDS_TOTAL');
    }

    return this.repo.create(
      {
        school: { connect: { id: schoolId } },
        student: { connect: { id: input.studentId } },
        invoiceNumber,
        totalAmount,
        discountAmount,
        netAmount,
        status: 'draft',
        dueDate: input.dueDate,
      },
      items,
      schoolId,
    );
  }

  async issue(id: string) {
    const invoice = await this.getById(id);

    if (invoice.status !== 'draft') {
      throw new AppError('Can only issue invoices in draft status', 400, 'INVOICE_NOT_DRAFT');
    }

    return this.repo.update(id, {
      status: 'issued',
      issuedAt: new Date(),
    });
  }

  async cancel(id: string, reason?: string) {
    const invoice = await this.getById(id);

    if (invoice.status !== 'draft' && invoice.status !== 'issued') {
      throw new AppError('Can only cancel draft or issued invoices', 400, 'INVOICE_NOT_DRAFT');
    }

    if (invoice.status === 'issued') {
      const hasPayments = await this.repo.hasPayments(id);
      if (hasPayments) {
        throw new AppError('Cannot cancel invoice with recorded payments', 400, 'INVOICE_HAS_PAYMENTS');
      }
    }

    return this.repo.update(id, {
      status: 'cancelled',
      ...(reason ? {} : {}),
    });
  }

  async bulkGenerate(schoolId: string, input: BulkGenerateInput) {
    const enrollments = await this.repo.getEnrolledStudentsForGrade(input.gradeId, input.academicYearId);
    const structures = await this.repo.getFeeStructuresByIds(input.feeStructureIds);

    if (structures.length === 0) {
      throw new AppError('No valid fee structures found', 404, 'FEE_STRUCTURE_NOT_FOUND');
    }

    let totalCreated = 0;
    let totalNet = 0;
    const skipped: Array<{ studentId: string; reason: string }> = [];

    for (const enrollment of enrollments) {
      try {
        const items = structures.map((s) => ({
          feeStructureId: s.id,
          description: s.name,
          quantity: 1,
          unitAmount: Number(s.amount.toString()),
        }));

        const result = await this.create(schoolId, {
          studentId: enrollment.studentId,
          dueDate: input.dueDate,
          items,
        });

        if (result) {
          totalCreated++;
          totalNet += Number(result.netAmount.toString());
        }
      } catch (err) {
        skipped.push({
          studentId: enrollment.studentId,
          reason: err instanceof AppError ? err.message : 'Unknown error',
        });
      }
    }

    return {
      totalInvoicesCreated: totalCreated,
      totalNetAmount: Math.round(totalNet * 100) / 100,
      studentsProcessed: enrollments.length,
      studentsSkipped: skipped.length,
      skippedReasons: skipped.length > 0 ? skipped : undefined,
    };
  }
}
