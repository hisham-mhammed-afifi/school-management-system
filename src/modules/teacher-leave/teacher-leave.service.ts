import type { TeacherLeaveRepository } from './teacher-leave.repository.ts';
import type { CreateTeacherLeaveInput, ListTeacherLeavesQuery } from './teacher-leave.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class TeacherLeaveService {
  private readonly repo: TeacherLeaveRepository;
  constructor(repo: TeacherLeaveRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListTeacherLeavesQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const leave = await this.repo.findById(id);
    if (!leave) throw new AppError('Teacher leave not found', 404, 'LEAVE_NOT_FOUND');
    return leave;
  }

  async create(schoolId: string, input: CreateTeacherLeaveInput) {
    return this.repo.create({
      school: { connect: { id: schoolId } },
      teacher: { connect: { id: input.teacherId } },
      leaveType: input.leaveType,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      reason: input.reason,
    });
  }

  async approve(id: string, approvedByUserId: string) {
    const leave = await this.getById(id);

    if (leave.status !== 'pending') {
      throw new AppError('Can only approve leaves in pending status', 400, 'LEAVE_NOT_PENDING');
    }

    // Check overlap with other approved leaves
    const hasOverlap = await this.repo.hasOverlap(leave.schoolId, leave.teacherId, leave.dateFrom, leave.dateTo, id);
    if (hasOverlap) {
      throw new AppError('Teacher already has an approved leave overlapping these dates', 409, 'LEAVE_OVERLAP');
    }

    return this.repo.update(id, {
      status: 'approved',
      approvedByUser: { connect: { id: approvedByUserId } },
      approvedAt: new Date(),
    });
  }

  async reject(id: string, approvedByUserId: string) {
    const leave = await this.getById(id);

    if (leave.status !== 'pending') {
      throw new AppError('Can only reject leaves in pending status', 400, 'LEAVE_NOT_PENDING');
    }

    return this.repo.update(id, {
      status: 'rejected',
      approvedByUser: { connect: { id: approvedByUserId } },
      approvedAt: new Date(),
    });
  }

  async cancel(id: string) {
    const leave = await this.getById(id);

    if (leave.status !== 'pending' && leave.status !== 'approved') {
      throw new AppError('Can only cancel pending or approved leaves', 400, 'LEAVE_NOT_PENDING');
    }

    if (leave.status === 'approved') {
      const now = new Date();
      if (leave.dateFrom <= now) {
        throw new AppError('Cannot cancel a leave that has already started', 400, 'LEAVE_ALREADY_STARTED');
      }
    }

    return this.repo.update(id, { status: 'cancelled' });
  }
}
