import type { StudentAttendanceRepository } from './student-attendance.repository.ts';
import type {
  BulkStudentAttendanceInput,
  CorrectStudentAttendanceInput,
  ListStudentAttendanceQuery,
  AttendanceSummaryQuery,
} from './student-attendance.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class StudentAttendanceService {
  private readonly repo: StudentAttendanceRepository;
  constructor(repo: StudentAttendanceRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListStudentAttendanceQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const record = await this.repo.findById(id);
    if (!record) throw new AppError('Attendance record not found', 404, 'ATTENDANCE_NOT_FOUND');
    return record;
  }

  async bulkRecord(schoolId: string, recordedBy: string, input: BulkStudentAttendanceInput) {
    return this.repo.bulkUpsert(
      schoolId,
      input.classSectionId,
      input.date,
      input.lessonId,
      recordedBy,
      input.records,
    );
  }

  async correct(id: string, input: CorrectStudentAttendanceInput) {
    await this.getById(id);
    return this.repo.update(id, {
      status: input.status,
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    });
  }

  async getSummary(schoolId: string, query: AttendanceSummaryQuery) {
    const raw = await this.repo.getSummary(schoolId, query);

    const byStudent = new Map<string, Record<string, number>>();
    for (const row of raw) {
      const existing = byStudent.get(row.studentId) ?? { present: 0, absent: 0, late: 0, excused: 0 };
      existing[row.status] = row._count.status;
      byStudent.set(row.studentId, existing);
    }

    const summary = Array.from(byStudent.entries()).map(([studentId, counts]) => {
      const present = counts['present'] ?? 0;
      const absent = counts['absent'] ?? 0;
      const late = counts['late'] ?? 0;
      const excused = counts['excused'] ?? 0;
      const total = present + absent + late + excused;
      return {
        studentId,
        ...counts,
        total,
        attendanceRate: total > 0 ? Math.round(((present + late) / total) * 10000) / 100 : 0,
      };
    });

    return summary;
  }
}
