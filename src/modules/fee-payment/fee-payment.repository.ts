import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListFeePaymentsQuery } from './fee-payment.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class FeePaymentRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  private readonly includeRelations = {
    invoice: { include: { student: true } },
    receivedByUser: true,
  } as const;

  async findMany(schoolId: string, query: ListFeePaymentsQuery) {
    const { page, limit, sortBy, order, invoiceId, paymentMethod } = query;
    const where: Prisma.FeePaymentWhereInput = { schoolId };

    if (invoiceId) where.invoiceId = invoiceId;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    const [data, total] = await Promise.all([
      this.db.feePayment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
        include: this.includeRelations,
      }),
      this.db.feePayment.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.feePayment.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  async create(data: Prisma.FeePaymentCreateInput) {
    return this.db.feePayment.create({ data, include: this.includeRelations });
  }

  async getTotalPaidForInvoice(invoiceId: string): Promise<number> {
    const result = await this.db.feePayment.aggregate({
      where: { invoiceId },
      _sum: { amountPaid: true },
    });
    return result._sum.amountPaid ? Number(result._sum.amountPaid.toString()) : 0;
  }

  async getInvoiceWithPayments(invoiceId: string) {
    return this.db.feeInvoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });
  }

  async updateInvoiceStatus(invoiceId: string, status: string) {
    return this.db.feeInvoice.update({
      where: { id: invoiceId },
      data: { status: status as 'issued' | 'partially_paid' | 'paid' | 'overdue' },
    });
  }
}
