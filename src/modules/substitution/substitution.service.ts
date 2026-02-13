import type { PrismaClient } from '../../generated/prisma/client.ts';
import type { SubstitutionRepository } from './substitution.repository.ts';
import type { CreateSubstitutionInput, UpdateSubstitutionInput, ListSubstitutionsQuery } from './substitution.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class SubstitutionService {
  private readonly repo: SubstitutionRepository;
  private readonly db: PrismaClient;
  constructor(repo: SubstitutionRepository, db: PrismaClient) {
    this.repo = repo;
    this.db = db;
  }

  async list(schoolId: string, query: ListSubstitutionsQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const sub = await this.repo.findById(id);
    if (!sub) throw new AppError('Substitution not found', 404, 'SUBSTITUTION_NOT_FOUND');
    return sub;
  }

  async create(schoolId: string, input: CreateSubstitutionInput) {
    // Load lesson
    const lesson = await this.db.lesson.findUnique({
      where: { id: input.lessonId },
      include: { timeSlot: true },
    });
    if (!lesson) throw new AppError('Lesson not found', 404, 'LESSON_NOT_FOUND');

    // Sub cannot be the original teacher
    if (input.substituteTeacherId === lesson.teacherId) {
      throw new AppError('Substitute cannot be the same as the original teacher', 422, 'SUBSTITUTE_IS_ORIGINAL_TEACHER');
    }

    // Check substitute is qualified for the subject
    const qualified = await this.db.teacherSubject.findFirst({
      where: { teacherId: input.substituteTeacherId, subjectId: lesson.subjectId },
    });
    if (!qualified) {
      throw new AppError('Substitute teacher is not qualified for this subject', 422, 'TEACHER_NOT_QUALIFIED');
    }

    // Check substitute has no lesson at same time slot in same term
    const conflictingLesson = await this.db.lesson.findFirst({
      where: {
        teacherId: input.substituteTeacherId,
        timeSlotId: lesson.timeSlotId,
        termId: lesson.termId,
        status: { not: 'cancelled' },
      },
    });
    if (conflictingLesson) {
      throw new AppError('Substitute teacher has a conflicting lesson', 409, 'SUBSTITUTE_HAS_CONFLICT');
    }

    // Check substitute has no other substitution at same time slot on same date
    const hasSubConflict = await this.repo.hasConflictingSubstitution(
      input.substituteTeacherId, input.date, lesson.timeSlotId,
    );
    if (hasSubConflict) {
      throw new AppError('Substitute already assigned elsewhere at same time on this date', 409, 'SUBSTITUTE_ALREADY_ASSIGNED');
    }

    return this.repo.create({
      school: { connect: { id: schoolId } },
      lesson: { connect: { id: input.lessonId } },
      originalTeacher: { connect: { id: lesson.teacherId } },
      substituteTeacher: { connect: { id: input.substituteTeacherId } },
      date: input.date,
      reason: input.reason,
    });
  }

  async update(id: string, input: UpdateSubstitutionInput) {
    const sub = await this.getById(id);

    // If changing substitute teacher, re-validate conflicts
    if (input.substituteTeacherId || input.date) {
      const substituteTeacherId = input.substituteTeacherId ?? sub.substituteTeacherId;
      const date = input.date ?? sub.date;

      const lesson = await this.db.lesson.findUnique({
        where: { id: sub.lessonId },
        include: { timeSlot: true },
      });
      if (!lesson) throw new AppError('Lesson not found', 404, 'LESSON_NOT_FOUND');

      if (substituteTeacherId === lesson.teacherId) {
        throw new AppError('Substitute cannot be the same as the original teacher', 422, 'SUBSTITUTE_IS_ORIGINAL_TEACHER');
      }

      if (input.substituteTeacherId) {
        const qualified = await this.db.teacherSubject.findFirst({
          where: { teacherId: substituteTeacherId, subjectId: lesson.subjectId },
        });
        if (!qualified) {
          throw new AppError('Substitute teacher is not qualified for this subject', 422, 'TEACHER_NOT_QUALIFIED');
        }
      }

      const conflictingLesson = await this.db.lesson.findFirst({
        where: {
          teacherId: substituteTeacherId,
          timeSlotId: lesson.timeSlotId,
          termId: lesson.termId,
          status: { not: 'cancelled' },
        },
      });
      if (conflictingLesson) {
        throw new AppError('Substitute teacher has a conflicting lesson', 409, 'SUBSTITUTE_HAS_CONFLICT');
      }

      const hasSubConflict = await this.repo.hasConflictingSubstitution(
        substituteTeacherId, date, lesson.timeSlotId, id,
      );
      if (hasSubConflict) {
        throw new AppError('Substitute already assigned elsewhere at same time on this date', 409, 'SUBSTITUTE_ALREADY_ASSIGNED');
      }
    }

    return this.repo.update(id, input);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repo.delete(id);
  }
}
