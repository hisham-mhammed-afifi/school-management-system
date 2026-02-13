import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type {
  OutstandingQuery,
  CollectionQuery,
  StudentBalanceQuery,
  CategoryBreakdownQuery,
} from './financial-report.schema.ts';

type InvoiceStatus = 'draft' | 'issued' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export class FinancialReportRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async getOutstandingInvoices(schoolId: string, query: OutstandingQuery) {
    // If gradeId filter, get student IDs first
    let studentIdFilter: string[] | undefined;
    if (query.gradeId) {
      const enrollments = await this.db.studentEnrollment.findMany({
        where: { classSection: { gradeId: query.gradeId }, status: 'active' },
        select: { studentId: true },
      });
      studentIdFilter = enrollments.map((e) => e.studentId);
      if (studentIdFilter.length === 0) return [];
    }

    const where: Prisma.FeeInvoiceWhereInput = {
      schoolId,
      status: query.status ? query.status : { in: ['issued', 'partially_paid', 'overdue'] as InvoiceStatus[] },
    };

    if (studentIdFilter) {
      where.studentId = { in: studentIdFilter };
    }

    const invoices = await this.db.feeInvoice.findMany({
      where,
      include: {
        student: true,
        payments: { select: { amountPaid: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    return invoices;
  }

  async getOutstandingSummary(schoolId: string, query: OutstandingQuery) {
    const statusFilter: InvoiceStatus[] = query.status
      ? [query.status]
      : ['issued', 'partially_paid', 'overdue'];

    const results = await this.db.feeInvoice.groupBy({
      by: ['status'],
      where: {
        schoolId,
        status: { in: statusFilter },
      },
      _count: { _all: true },
      _sum: { netAmount: true },
    });

    return results;
  }

  async getPaymentsByDateRange(schoolId: string, query: CollectionQuery) {
    const where: Prisma.FeePaymentWhereInput = {
      schoolId,
      paymentDate: { gte: query.from, lte: query.to },
    };

    if (query.paymentMethod) {
      where.paymentMethod = query.paymentMethod;
    }

    const payments = await this.db.feePayment.findMany({
      where,
      include: {
        invoice: { select: { invoiceNumber: true, studentId: true } },
      },
      orderBy: { paymentDate: 'asc' },
    });

    return payments;
  }

  async getCollectionByMethod(schoolId: string, query: CollectionQuery) {
    const where: Prisma.FeePaymentWhereInput = {
      schoolId,
      paymentDate: { gte: query.from, lte: query.to },
    };

    if (query.paymentMethod) {
      where.paymentMethod = query.paymentMethod;
    }

    const results = await this.db.feePayment.groupBy({
      by: ['paymentMethod'],
      where,
      _count: { _all: true },
      _sum: { amountPaid: true },
    });

    return results;
  }

  async getStudentBalances(schoolId: string, query: StudentBalanceQuery) {
    const { page, limit, gradeId, search } = query;

    const studentWhere: Prisma.StudentWhereInput = { schoolId };
    if (gradeId) {
      studentWhere.studentEnrollments = { some: { classSection: { gradeId }, status: 'active' } };
    }
    if (search) {
      studentWhere.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { studentCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [students, total] = await Promise.all([
      this.db.student.findMany({
        where: studentWhere,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { lastName: 'asc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          studentCode: true,
          feeInvoices: {
            where: { status: { not: 'cancelled' } },
            select: {
              netAmount: true,
              status: true,
              payments: { select: { amountPaid: true } },
            },
          },
        },
      }),
      this.db.student.count({ where: studentWhere }),
    ]);

    return { students, total, page, limit };
  }

  async getCategoryBreakdown(schoolId: string, query: CategoryBreakdownQuery) {
    const invoiceItemWhere: Prisma.FeeInvoiceItemWhereInput = { schoolId };

    const invoiceFilter: Prisma.FeeInvoiceWhereInput = { status: { not: 'cancelled' } };
    if (query.from || query.to) {
      invoiceFilter.createdAt = {};
      if (query.from) invoiceFilter.createdAt.gte = query.from;
      if (query.to) invoiceFilter.createdAt.lte = query.to;
    }
    invoiceItemWhere.invoice = invoiceFilter;

    const items = await this.db.feeInvoiceItem.findMany({
      where: invoiceItemWhere,
      include: {
        feeStructure: {
          include: { feeCategory: true },
        },
      },
    });

    return items;
  }
}
