import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListFeeInvoicesQuery } from './fee-invoice.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class FeeInvoiceRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  private readonly includeRelations = {
    student: true,
    items: { include: { feeStructure: true } },
    payments: true,
  } as const;

  async findMany(schoolId: string, query: ListFeeInvoicesQuery) {
    const { page, limit, sortBy, order, studentId, status } = query;
    const where: Prisma.FeeInvoiceWhereInput = { schoolId };

    if (studentId) where.studentId = studentId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.db.feeInvoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
        include: this.includeRelations,
      }),
      this.db.feeInvoice.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.feeInvoice.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  async create(
    data: Prisma.FeeInvoiceCreateInput,
    items: Array<{ feeStructureId: string; description?: string; quantity: number; unitAmount: number; totalAmount: number }>,
    schoolId: string,
  ) {
    return this.db.$transaction(async (tx) => {
      const invoice = await tx.feeInvoice.create({ data });

      await Promise.all(
        items.map((item) =>
          tx.feeInvoiceItem.create({
            data: {
              school: { connect: { id: schoolId } },
              invoice: { connect: { id: invoice.id } },
              feeStructure: { connect: { id: item.feeStructureId } },
              description: item.description ?? null,
              quantity: item.quantity,
              unitAmount: item.unitAmount,
              totalAmount: item.totalAmount,
            },
          }),
        ),
      );

      return tx.feeInvoice.findUnique({
        where: { id: invoice.id },
        include: this.includeRelations,
      });
    });
  }

  async update(id: string, data: Prisma.FeeInvoiceUpdateInput) {
    return this.db.feeInvoice.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  async getNextInvoiceNumber(schoolId: string): Promise<string> {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `INV-${yearMonth}-`;

    const lastInvoice = await this.db.feeInvoice.findFirst({
      where: { schoolId, invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: 'desc' },
      select: { invoiceNumber: true },
    });

    let seq = 1;
    if (lastInvoice) {
      const parts = lastInvoice.invoiceNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1]!, 10);
      if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }

    return `${prefix}${String(seq).padStart(4, '0')}`;
  }

  async getDiscountsForStudent(schoolId: string, studentId: string, feeStructureIds: string[]) {
    return this.db.feeDiscount.findMany({
      where: { schoolId, studentId, feeStructureId: { in: feeStructureIds } },
    });
  }

  async getEnrolledStudentsForGrade(gradeId: string, academicYearId: string) {
    return this.db.studentEnrollment.findMany({
      where: {
        status: 'active',
        classSection: { gradeId },
        academicYearId,
      },
      include: { student: true },
    });
  }

  async getFeeStructuresByIds(ids: string[]) {
    return this.db.feeStructure.findMany({ where: { id: { in: ids } } });
  }

  async hasPayments(invoiceId: string): Promise<boolean> {
    const count = await this.db.feePayment.count({ where: { invoiceId } });
    return count > 0;
  }
}
