import type { SelfServiceRepository } from './self-service.repository.ts';
import type { PaginationQuery, TimetableQuery, AttendanceQuery, GradesQuery, SubmitLeaveInput } from './self-service.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class SelfServiceService {
  private readonly repo: SelfServiceRepository;
  constructor(repo: SelfServiceRepository) {
    this.repo = repo;
  }

  private async resolveUser(userId: string) {
    const user = await this.repo.getUserWithLinks(userId);
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    return user;
  }

  private async requireTeacher(userId: string): Promise<string> {
    const user = await this.resolveUser(userId);
    if (!user.teacherId) throw new AppError('User is not linked to a teacher profile', 403, 'NOT_A_TEACHER');
    return user.teacherId;
  }

  private async requireStudent(userId: string): Promise<string> {
    const user = await this.resolveUser(userId);
    if (!user.studentId) throw new AppError('User is not linked to a student profile', 403, 'NOT_A_STUDENT');
    return user.studentId;
  }

  private async requireGuardian(userId: string): Promise<string> {
    const user = await this.resolveUser(userId);
    if (!user.guardianId) throw new AppError('User is not linked to a guardian profile', 403, 'NOT_A_GUARDIAN');
    return user.guardianId;
  }

  // ---- Shared ----

  async getMyTimetable(userId: string, query: TimetableQuery) {
    const user = await this.resolveUser(userId);
    if (user.teacherId) return this.repo.getTeacherTimetable(user.teacherId, query);
    if (user.studentId) return this.repo.getStudentTimetable(user.studentId, query);
    throw new AppError('User is not linked to a teacher or student profile', 403, 'NO_TIMETABLE');
  }

  // ---- Teacher ----

  async getMyClasses(userId: string) {
    const teacherId = await this.requireTeacher(userId);
    return this.repo.getTeacherClasses(teacherId);
  }

  async getMyLeaves(userId: string, query: PaginationQuery) {
    const teacherId = await this.requireTeacher(userId);
    return this.repo.getTeacherLeaves(teacherId, query);
  }

  async submitMyLeave(userId: string, input: SubmitLeaveInput) {
    const user = await this.resolveUser(userId);
    if (!user.teacherId) throw new AppError('User is not linked to a teacher profile', 403, 'NOT_A_TEACHER');
    if (!user.schoolId) throw new AppError('User has no school association', 400, 'NO_SCHOOL');
    return this.repo.createTeacherLeave(user.schoolId, user.teacherId, input);
  }

  async getMySubstitutions(userId: string, query: PaginationQuery) {
    const teacherId = await this.requireTeacher(userId);
    return this.repo.getTeacherSubstitutions(teacherId, query);
  }

  // ---- Student ----

  async getMyTimetableAsStudent(userId: string, query: TimetableQuery) {
    const studentId = await this.requireStudent(userId);
    return this.repo.getStudentTimetable(studentId, query);
  }

  async getMyGrades(userId: string, query: GradesQuery) {
    const studentId = await this.requireStudent(userId);
    return this.repo.getStudentGrades(studentId, query);
  }

  async getMyAttendance(userId: string, query: AttendanceQuery) {
    const studentId = await this.requireStudent(userId);
    return this.repo.getStudentAttendance(studentId, query);
  }

  async getMyReportCards(userId: string, query: PaginationQuery) {
    const studentId = await this.requireStudent(userId);
    return this.repo.getStudentReportCards(studentId, query);
  }

  async getMyInvoices(userId: string, query: PaginationQuery) {
    const studentId = await this.requireStudent(userId);
    return this.repo.getStudentInvoices(studentId, query);
  }

  // ---- Guardian ----

  async getMyChildren(userId: string) {
    const guardianId = await this.requireGuardian(userId);
    return this.repo.getGuardianChildren(guardianId);
  }

  async getChildGrades(userId: string, studentId: string, query: GradesQuery) {
    const guardianId = await this.requireGuardian(userId);
    await this.verifyGuardianAccess(guardianId, studentId);
    return this.repo.getStudentGrades(studentId, query);
  }

  async getChildAttendance(userId: string, studentId: string, query: AttendanceQuery) {
    const guardianId = await this.requireGuardian(userId);
    await this.verifyGuardianAccess(guardianId, studentId);
    return this.repo.getStudentAttendance(studentId, query);
  }

  async getChildReportCards(userId: string, studentId: string, query: PaginationQuery) {
    const guardianId = await this.requireGuardian(userId);
    await this.verifyGuardianAccess(guardianId, studentId);
    return this.repo.getStudentReportCards(studentId, query);
  }

  async getChildInvoices(userId: string, studentId: string, query: PaginationQuery) {
    const guardianId = await this.requireGuardian(userId);
    await this.verifyGuardianAccess(guardianId, studentId);
    return this.repo.getStudentInvoices(studentId, query);
  }

  private async verifyGuardianAccess(guardianId: string, studentId: string): Promise<void> {
    const isLinked = await this.repo.isGuardianOfStudent(guardianId, studentId);
    if (!isLinked) throw new AppError('You are not a guardian of this student', 403, 'NOT_GUARDIAN_OF_STUDENT');
  }
}
