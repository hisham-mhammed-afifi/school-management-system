import type { PrismaClient } from '../../generated/prisma/client.ts';

export class DashboardRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  // ---- School admin dashboard ----

  async getStudentCount(schoolId: string): Promise<number> {
    return this.db.student.count({ where: { schoolId, status: 'active', deletedAt: null } });
  }

  async getTeacherCount(schoolId: string): Promise<number> {
    return this.db.teacher.count({ where: { schoolId, status: 'active', deletedAt: null } });
  }

  async getClassSectionCount(schoolId: string): Promise<number> {
    return this.db.classSection.count({ where: { schoolId } });
  }

  async getAttendanceRateToday(schoolId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [total, present] = await Promise.all([
      this.db.studentAttendance.count({
        where: { schoolId, date: { gte: startOfDay, lte: endOfDay } },
      }),
      this.db.studentAttendance.count({
        where: { schoolId, date: { gte: startOfDay, lte: endOfDay }, status: 'present' },
      }),
    ]);

    return { total, present, rate: total > 0 ? Math.round((present / total) * 10000) / 100 : 0 };
  }

  async getAttendanceTodayByClass(schoolId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const records = await this.db.studentAttendance.groupBy({
      by: ['classSectionId'],
      where: { schoolId, date: { gte: startOfDay, lte: endOfDay } },
      _count: { _all: true },
    });

    const presentRecords = await this.db.studentAttendance.groupBy({
      by: ['classSectionId'],
      where: { schoolId, date: { gte: startOfDay, lte: endOfDay }, status: 'present' },
      _count: { _all: true },
    });

    const presentMap = new Map(presentRecords.map((r) => [r.classSectionId, r._count._all]));

    // Get class section names
    const sectionIds = records.map((r) => r.classSectionId);
    const sections = await this.db.classSection.findMany({
      where: { id: { in: sectionIds } },
      include: { grade: true },
    });
    const sectionMap = new Map(sections.map((s) => [s.id, s]));

    return records.map((r) => {
      const total = r._count._all;
      const present = presentMap.get(r.classSectionId) ?? 0;
      const section = sectionMap.get(r.classSectionId);
      return {
        classSectionId: r.classSectionId,
        className: section ? `${section.grade.name} - ${section.name}` : r.classSectionId,
        total,
        present,
        absent: total - present,
        rate: total > 0 ? Math.round((present / total) * 10000) / 100 : 0,
      };
    });
  }

  async getFeesSummary(schoolId: string) {
    const [outstanding, collected, overdue] = await Promise.all([
      this.db.feeInvoice.aggregate({
        where: { schoolId, status: { in: ['issued', 'partially_paid'] } },
        _sum: { netAmount: true },
        _count: { _all: true },
      }),
      this.db.feePayment.aggregate({
        where: { schoolId },
        _sum: { amountPaid: true },
        _count: { _all: true },
      }),
      this.db.feeInvoice.aggregate({
        where: { schoolId, status: 'overdue' },
        _sum: { netAmount: true },
        _count: { _all: true },
      }),
    ]);

    return {
      outstanding: {
        amount: outstanding._sum.netAmount ? Number(outstanding._sum.netAmount.toString()) : 0,
        count: outstanding._count._all,
      },
      collected: {
        amount: collected._sum.amountPaid ? Number(collected._sum.amountPaid.toString()) : 0,
        count: collected._count._all,
      },
      overdue: {
        amount: overdue._sum.netAmount ? Number(overdue._sum.netAmount.toString()) : 0,
        count: overdue._count._all,
      },
    };
  }

  async getRecentAuditLogs(schoolId: string, limit: number) {
    return this.db.auditLog.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // ---- Super admin / platform dashboard ----

  async getPlatformMetrics() {
    const [schoolCount, userCount] = await Promise.all([
      this.db.school.count(),
      this.db.user.count(),
    ]);

    return { schoolCount, userCount };
  }

  async getExpiringSchools(withinDays: number) {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() + withinDays);

    return this.db.school.findMany({
      where: {
        subscriptionExpiresAt: { gte: now, lte: cutoff },
      },
      orderBy: { subscriptionExpiresAt: 'asc' },
      select: {
        id: true,
        name: true,
        subscriptionPlan: true,
        subscriptionExpiresAt: true,
      },
    });
  }
}
