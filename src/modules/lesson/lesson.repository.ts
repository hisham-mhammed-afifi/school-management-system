import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListLessonsQuery } from './lesson.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

const ACTIVE_STATUS: Prisma.LessonWhereInput = { status: { not: 'cancelled' } };

export class LessonRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  private readonly includeRelations = {
    classSection: true,
    subject: true,
    teacher: true,
    room: true,
    timeSlot: { include: { period: true } },
  } as const;

  async findMany(schoolId: string, query: ListLessonsQuery) {
    const { page, limit, sortBy, order, termId, classSectionId, teacherId, dayOfWeek } = query;
    const where: Prisma.LessonWhereInput = { schoolId, ...ACTIVE_STATUS };

    if (termId) where.termId = termId;
    if (classSectionId) where.classSectionId = classSectionId;
    if (teacherId) where.teacherId = teacherId;
    if (dayOfWeek !== undefined) where.timeSlot = { dayOfWeek };

    const [data, total] = await Promise.all([
      this.db.lesson.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
        include: this.includeRelations,
      }),
      this.db.lesson.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.lesson.findUnique({
      where: { id },
      include: this.includeRelations,
    });
  }

  async create(data: Prisma.LessonCreateInput) {
    return this.db.lesson.create({
      data,
      include: this.includeRelations,
    });
  }

  async update(id: string, data: Prisma.LessonUpdateInput) {
    return this.db.lesson.update({
      where: { id },
      data,
      include: this.includeRelations,
    });
  }

  async cancel(id: string) {
    return this.db.lesson.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }

  async clearByTerm(schoolId: string, termId: string) {
    const result = await this.db.lesson.deleteMany({
      where: { schoolId, termId },
    });
    return result.count;
  }

  async bulkCreate(lessons: Prisma.LessonCreateManyInput[]) {
    return this.db.lesson.createMany({ data: lessons });
  }

  // ---- Conflict checks (app-level partial unique index logic) ----

  async hasTeacherConflict(schoolId: string, teacherId: string, timeSlotId: string, termId: string, excludeId?: string) {
    const where: Prisma.LessonWhereInput = {
      schoolId, teacherId, timeSlotId, termId, ...ACTIVE_STATUS,
    };
    if (excludeId) where.id = { not: excludeId };
    return (await this.db.lesson.count({ where })) > 0;
  }

  async hasClassConflict(schoolId: string, classSectionId: string, timeSlotId: string, termId: string, excludeId?: string) {
    const where: Prisma.LessonWhereInput = {
      schoolId, classSectionId, timeSlotId, termId, ...ACTIVE_STATUS,
    };
    if (excludeId) where.id = { not: excludeId };
    return (await this.db.lesson.count({ where })) > 0;
  }

  async hasRoomConflict(schoolId: string, roomId: string, timeSlotId: string, termId: string, excludeId?: string) {
    const where: Prisma.LessonWhereInput = {
      schoolId, roomId, timeSlotId, termId, ...ACTIVE_STATUS,
    };
    if (excludeId) where.id = { not: excludeId };
    return (await this.db.lesson.count({ where })) > 0;
  }

  // ---- Timetable views ----

  async getTimetableByClass(schoolId: string, termId: string, classSectionId: string) {
    return this.db.lesson.findMany({
      where: { schoolId, termId, classSectionId, ...ACTIVE_STATUS },
      include: this.includeRelations,
    });
  }

  async getTimetableByTeacher(schoolId: string, termId: string, teacherId: string) {
    return this.db.lesson.findMany({
      where: { schoolId, termId, teacherId, ...ACTIVE_STATUS },
      include: this.includeRelations,
    });
  }

  async getTimetableByRoom(schoolId: string, termId: string, roomId: string) {
    return this.db.lesson.findMany({
      where: { schoolId, termId, roomId, ...ACTIVE_STATUS },
      include: this.includeRelations,
    });
  }

  // ---- Data loading for auto-generate ----

  async findExistingLessons(schoolId: string, termId: string) {
    return this.db.lesson.findMany({
      where: { schoolId, termId, ...ACTIVE_STATUS },
    });
  }
}
