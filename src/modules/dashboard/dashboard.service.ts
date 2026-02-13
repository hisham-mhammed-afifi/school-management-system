import type { DashboardRepository } from './dashboard.repository.ts';
import type { AttendanceDateQuery } from './dashboard.schema.ts';

export class DashboardService {
  private readonly repo: DashboardRepository;
  constructor(repo: DashboardRepository) {
    this.repo = repo;
  }

  async getOverview(schoolId: string) {
    const today = new Date();
    const [studentCount, teacherCount, classSectionCount, attendanceToday, feesSummary] = await Promise.all([
      this.repo.getStudentCount(schoolId),
      this.repo.getTeacherCount(schoolId),
      this.repo.getClassSectionCount(schoolId),
      this.repo.getAttendanceRateToday(schoolId, today),
      this.repo.getFeesSummary(schoolId),
    ]);

    return {
      students: studentCount,
      teachers: teacherCount,
      classSections: classSectionCount,
      attendanceToday: attendanceToday.rate,
      fees: feesSummary,
    };
  }

  async getAttendanceToday(schoolId: string, query: AttendanceDateQuery) {
    const date = query.date ?? new Date();
    return this.repo.getAttendanceTodayByClass(schoolId, date);
  }

  async getFeesSummary(schoolId: string) {
    return this.repo.getFeesSummary(schoolId);
  }

  async getRecentActivity(schoolId: string) {
    return this.repo.getRecentAuditLogs(schoolId, 20);
  }

  // ---- Platform ----

  async getPlatformDashboard() {
    return this.repo.getPlatformMetrics();
  }

  async getExpiringSchools() {
    return this.repo.getExpiringSchools(30);
  }
}
