import type { TeacherAttendanceRepository } from './teacher-attendance.repository.ts';
import type {
  RecordTeacherAttendanceInput,
  CorrectTeacherAttendanceInput,
  ListTeacherAttendanceQuery,
} from './teacher-attendance.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

function timeStringToDate(time: string): Date {
  const parts = time.split(':').map(Number);
  return new Date(1970, 0, 1, parts[0], parts[1], 0, 0);
}

export class TeacherAttendanceService {
  private readonly repo: TeacherAttendanceRepository;
  constructor(repo: TeacherAttendanceRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListTeacherAttendanceQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const record = await this.repo.findById(id);
    if (!record) throw new AppError('Teacher attendance record not found', 404, 'ATTENDANCE_NOT_FOUND');
    return record;
  }

  async record(schoolId: string, input: RecordTeacherAttendanceInput) {
    const existing = await this.repo.findByTeacherAndDate(schoolId, input.teacherId, input.date);
    if (existing) {
      throw new AppError(
        'Attendance already recorded for this teacher on this date',
        409,
        'ATTENDANCE_DUPLICATE',
      );
    }

    return this.repo.create({
      school: { connect: { id: schoolId } },
      teacher: { connect: { id: input.teacherId } },
      date: input.date,
      status: input.status,
      ...(input.checkIn ? { checkIn: timeStringToDate(input.checkIn) } : {}),
      ...(input.checkOut ? { checkOut: timeStringToDate(input.checkOut) } : {}),
    });
  }

  async correct(id: string, input: CorrectTeacherAttendanceInput) {
    await this.getById(id);

    const data: Record<string, unknown> = {};
    if (input.status !== undefined) data['status'] = input.status;
    if (input.checkIn !== undefined) data['checkIn'] = timeStringToDate(input.checkIn);
    if (input.checkOut !== undefined) data['checkOut'] = timeStringToDate(input.checkOut);

    if (Object.keys(data).length === 0) {
      throw new AppError('No fields to update', 400, 'NO_UPDATE_FIELDS');
    }

    return this.repo.update(id, data);
  }
}
