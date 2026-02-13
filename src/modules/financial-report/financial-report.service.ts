import type { FinancialReportRepository } from './financial-report.repository.ts';
import type {
  OutstandingQuery,
  CollectionQuery,
  StudentBalanceQuery,
  CategoryBreakdownQuery,
} from './financial-report.schema.ts';

interface DecimalLike {
  toString(): string;
}

function toNum(val: DecimalLike): number {
  return Number(val.toString());
}

export class FinancialReportService {
  private readonly repo: FinancialReportRepository;
  constructor(repo: FinancialReportRepository) {
    this.repo = repo;
  }

  async getOutstanding(schoolId: string, query: OutstandingQuery) {
    const [invoices, summary] = await Promise.all([
      this.repo.getOutstandingInvoices(schoolId, query),
      this.repo.getOutstandingSummary(schoolId, query),
    ]);

    const byStatus = summary.map((s) => ({
      status: s.status,
      count: s._count._all,
      totalNet: s._sum.netAmount ? toNum(s._sum.netAmount) : 0,
    }));

    const topDebtors = invoices
      .map((inv) => {
        const paid = inv.payments.reduce((sum, p) => sum + toNum(p.amountPaid), 0);
        const balance = toNum(inv.netAmount) - paid;
        return {
          studentId: inv.studentId,
          studentName: `${inv.student.firstName} ${inv.student.lastName}`,
          studentCode: inv.student.studentCode,
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          netAmount: toNum(inv.netAmount),
          paid,
          balance,
          status: inv.status,
          dueDate: inv.dueDate,
        };
      })
      .filter((d) => d.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 20);

    const totalOutstanding = topDebtors.reduce((sum, d) => sum + d.balance, 0);

    return {
      summary: {
        totalOutstanding: Math.round(totalOutstanding * 100) / 100,
        byStatus,
      },
      topDebtors,
    };
  }

  async getCollection(schoolId: string, query: CollectionQuery) {
    const [payments, byMethod] = await Promise.all([
      this.repo.getPaymentsByDateRange(schoolId, query),
      this.repo.getCollectionByMethod(schoolId, query),
    ]);

    const totalCollected = payments.reduce((sum, p) => sum + toNum(p.amountPaid), 0);

    const methodSummary = byMethod.map((m) => ({
      method: m.paymentMethod,
      count: m._count._all,
      total: m._sum.amountPaid ? toNum(m._sum.amountPaid) : 0,
    }));

    // Group by date for timeline
    const byDate = new Map<string, number>();
    for (const p of payments) {
      const dateKey = p.paymentDate.toISOString().split('T')[0] ?? '';
      byDate.set(dateKey, (byDate.get(dateKey) ?? 0) + toNum(p.amountPaid));
    }

    const timeline = Array.from(byDate.entries())
      .map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      summary: {
        totalCollected: Math.round(totalCollected * 100) / 100,
        paymentCount: payments.length,
        byMethod: methodSummary,
      },
      timeline,
    };
  }

  async getStudentBalances(schoolId: string, query: StudentBalanceQuery) {
    const result = await this.repo.getStudentBalances(schoolId, query);

    const data = result.students.map((s) => {
      let totalInvoiced = 0;
      let totalPaid = 0;

      for (const inv of s.feeInvoices) {
        totalInvoiced += toNum(inv.netAmount);
        for (const p of inv.payments) {
          totalPaid += toNum(p.amountPaid);
        }
      }

      const balance = totalInvoiced - totalPaid;
      return {
        studentId: s.id,
        studentName: `${s.firstName} ${s.lastName}`,
        studentCode: s.studentCode,
        totalInvoiced: Math.round(totalInvoiced * 100) / 100,
        totalPaid: Math.round(totalPaid * 100) / 100,
        balance: Math.round(balance * 100) / 100,
        invoiceCount: s.feeInvoices.length,
      };
    });

    return {
      data,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  async getCategoryBreakdown(schoolId: string, query: CategoryBreakdownQuery) {
    const items = await this.repo.getCategoryBreakdown(schoolId, query);

    const categoryMap = new Map<string, { categoryId: string; categoryName: string; totalAmount: number; itemCount: number }>();

    for (const item of items) {
      const catId = item.feeStructure.feeCategoryId;
      const catName = item.feeStructure.feeCategory.name;
      const existing = categoryMap.get(catId);

      if (existing) {
        existing.totalAmount += toNum(item.totalAmount);
        existing.itemCount += 1;
      } else {
        categoryMap.set(catId, {
          categoryId: catId,
          categoryName: catName,
          totalAmount: toNum(item.totalAmount),
          itemCount: 1,
        });
      }
    }

    const categories = Array.from(categoryMap.values())
      .map((c) => ({
        ...c,
        totalAmount: Math.round(c.totalAmount * 100) / 100,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    const grandTotal = categories.reduce((sum, c) => sum + c.totalAmount, 0);

    return {
      grandTotal: Math.round(grandTotal * 100) / 100,
      categories: categories.map((c) => ({
        ...c,
        percentage: grandTotal > 0 ? Math.round((c.totalAmount / grandTotal) * 10000) / 100 : 0,
      })),
    };
  }
}
