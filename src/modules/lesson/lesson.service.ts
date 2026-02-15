import type { PrismaClient } from '../../generated/prisma/client.ts';
import type { LessonRepository } from './lesson.repository.ts';
import type { CreateLessonInput, UpdateLessonInput, ListLessonsQuery, AutoGenerateInput } from './lesson.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

interface TimetableLesson {
  lessonId: string;
  subject: string;
  teacher: string;
  room: string;
}

type TimetableGrid = Record<string, Record<string, TimetableLesson | null> | null>;

export class LessonService {
  private readonly repo: LessonRepository;
  private readonly db: PrismaClient;
  constructor(repo: LessonRepository, db: PrismaClient) {
    this.repo = repo;
    this.db = db;
  }

  async list(schoolId: string, query: ListLessonsQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const lesson = await this.repo.findById(id);
    if (!lesson) throw new AppError('Lesson not found', 404, 'LESSON_NOT_FOUND');
    return lesson;
  }

  async create(schoolId: string, input: CreateLessonInput) {
    await this.validateConflicts(schoolId, input.teacherId, input.classSectionId, input.roomId, input.timeSlotId, input.termId, input.subjectId);

    return this.repo.create({
      school: { connect: { id: schoolId } },
      academicYear: { connect: { id: input.academicYearId } },
      term: { connect: { id: input.termId } },
      classSection: { connect: { id: input.classSectionId } },
      subject: { connect: { id: input.subjectId } },
      teacher: { connect: { id: input.teacherId } },
      room: { connect: { id: input.roomId } },
      timeSlot: { connect: { id: input.timeSlotId } },
    });
  }

  async update(id: string, input: UpdateLessonInput) {
    const lesson = await this.getById(id);
    if (lesson.status !== 'scheduled') {
      throw new AppError('Only scheduled lessons can be updated', 400, 'INVALID_STATUS_TRANSITION');
    }

    const teacherId = input.teacherId ?? lesson.teacherId;
    const roomId = input.roomId ?? lesson.roomId;
    const timeSlotId = input.timeSlotId ?? lesson.timeSlotId;

    await this.validateConflicts(lesson.schoolId, teacherId, lesson.classSectionId, roomId, timeSlotId, lesson.termId, lesson.subjectId, id);

    const data: Record<string, unknown> = {};
    if (input.teacherId) data['teacher'] = { connect: { id: input.teacherId } };
    if (input.roomId) data['room'] = { connect: { id: input.roomId } };
    if (input.timeSlotId) data['timeSlot'] = { connect: { id: input.timeSlotId } };

    return this.repo.update(id, data as never);
  }

  async cancel(id: string) {
    const lesson = await this.getById(id);
    if (lesson.status === 'cancelled') {
      throw new AppError('Lesson is already cancelled', 400, 'LESSON_ALREADY_CANCELLED');
    }
    if (lesson.status !== 'scheduled') {
      throw new AppError(`Cannot cancel a lesson with status '${lesson.status}'`, 400, 'INVALID_STATUS_TRANSITION');
    }
    return this.repo.cancel(id);
  }

  async clearByTerm(schoolId: string, termId: string) {
    const count = await this.repo.clearByTerm(schoolId, termId);
    return { deletedCount: count };
  }

  async bulkCreate(schoolId: string, lessons: CreateLessonInput[]) {
    let created = 0;
    const errors: Array<{ index: number; code: string; message: string }> = [];

    for (let i = 0; i < lessons.length; i++) {
      const input = lessons[i];
      if (!input) continue;
      try {
        await this.validateConflicts(schoolId, input.teacherId, input.classSectionId, input.roomId, input.timeSlotId, input.termId, input.subjectId);

        await this.repo.create({
          school: { connect: { id: schoolId } },
          academicYear: { connect: { id: input.academicYearId } },
          term: { connect: { id: input.termId } },
          classSection: { connect: { id: input.classSectionId } },
          subject: { connect: { id: input.subjectId } },
          teacher: { connect: { id: input.teacherId } },
          room: { connect: { id: input.roomId } },
          timeSlot: { connect: { id: input.timeSlotId } },
        });
        created++;
      } catch (err) {
        if (err instanceof AppError) {
          errors.push({ index: i, code: err.code, message: err.message });
        } else {
          errors.push({ index: i, code: 'UNKNOWN_ERROR', message: 'Failed to create lesson' });
        }
      }
    }

    return { created, failed: errors.length, errors };
  }

  async autoGenerate(schoolId: string, input: AutoGenerateInput) {
    const { termId, periodSetId, options } = input;

    // Load term to get academicYearId
    const term = await this.db.term.findUnique({ where: { id: termId } });
    if (!term) throw new AppError('Term not found', 404, 'TERM_NOT_FOUND');
    const academicYearId = term.academicYearId;

    // Load all inputs
    const [requirements, teachers, teacherSubjects, availability, rooms, roomSuitability, timeSlots, existingLessons] = await Promise.all([
      this.db.classSubjectRequirement.findMany({
        where: { schoolId, academicYearId },
        include: { classSection: true, subject: true },
      }),
      this.db.teacher.findMany({
        where: { schoolId, status: 'active', deletedAt: null },
      }),
      this.db.teacherSubject.findMany({ where: { schoolId } }),
      this.db.teacherAvailability.findMany({ where: { schoolId, isAvailable: false } }),
      this.db.room.findMany({ where: { schoolId } }),
      this.db.roomSubjectSuitability.findMany({ where: { schoolId } }),
      this.db.timeSlot.findMany({
        where: { schoolId, period: { periodSetId, isBreak: false } },
        include: { period: true },
      }),
      this.repo.findExistingLessons(schoolId, termId),
    ]);

    // Build lookup maps
    const teacherSubjectMap = new Map<string, Set<string>>();
    for (const ts of teacherSubjects) {
      if (!teacherSubjectMap.has(ts.teacherId)) teacherSubjectMap.set(ts.teacherId, new Set());
      teacherSubjectMap.get(ts.teacherId)!.add(ts.subjectId);
    }

    const unavailableSet = new Set<string>();
    for (const a of availability) {
      unavailableSet.add(`${a.teacherId}:${a.dayOfWeek}:${a.periodId}`);
    }

    const roomSuitabilityMap = new Map<string, Set<string>>();
    for (const rs of roomSuitability) {
      if (!roomSuitabilityMap.has(rs.roomId)) roomSuitabilityMap.set(rs.roomId, new Set());
      roomSuitabilityMap.get(rs.roomId)!.add(rs.subjectId);
    }

    // Constraint maps
    const teacherSlotUsed = new Map<string, Set<string>>();
    const classSlotUsed = new Map<string, Set<string>>();
    const roomSlotUsed = new Map<string, Set<string>>();

    const markUsed = (map: Map<string, Set<string>>, key: string, slotId: string) => {
      if (!map.has(key)) map.set(key, new Set());
      map.get(key)!.add(slotId);
    };

    const isUsed = (map: Map<string, Set<string>>, key: string, slotId: string) => {
      return map.get(key)?.has(slotId) ?? false;
    };

    // Pre-populate from existing lessons
    for (const l of existingLessons) {
      markUsed(teacherSlotUsed, l.teacherId, l.timeSlotId);
      markUsed(classSlotUsed, l.classSectionId, l.timeSlotId);
      markUsed(roomSlotUsed, l.roomId, l.timeSlotId);
    }

    // Sort requirements by constraint tightness (most constrained first)
    const sortedReqs = [...requirements].sort((a, b) => {
      const aTeachers = teachers.filter((t) => teacherSubjectMap.get(t.id)?.has(a.subjectId)).length;
      const bTeachers = teachers.filter((t) => teacherSubjectMap.get(t.id)?.has(b.subjectId)).length;
      return aTeachers - bTeachers;
    });

    // Shuffle time slots for variety
    const shuffledSlots = [...timeSlots].sort(() => Math.random() - 0.5);

    const lessonsToCreate: Array<{
      schoolId: string;
      academicYearId: string;
      termId: string;
      classSectionId: string;
      subjectId: string;
      teacherId: string;
      roomId: string;
      timeSlotId: string;
    }> = [];

    const unfulfilled: Array<{
      classSectionId: string;
      classSectionName: string;
      subjectId: string;
      subjectName: string;
      requiredLessons: number;
      scheduledLessons: number;
      reason: string;
    }> = [];

    for (const req of sortedReqs) {
      const eligibleTeachers = teachers.filter((t) => teacherSubjectMap.get(t.id)?.has(req.subjectId));
      let scheduled = 0;

      for (let n = 0; n < req.weeklyLessonsRequired; n++) {
        let placed = false;

        for (const slot of shuffledSlots) {
          if (isUsed(classSlotUsed, req.classSectionId, slot.id)) continue;

          for (const teacher of eligibleTeachers) {
            if (isUsed(teacherSlotUsed, teacher.id, slot.id)) continue;

            // Teacher availability check
            if (options.respectTeacherAvailability) {
              const key = `${teacher.id}:${slot.dayOfWeek}:${slot.periodId}`;
              if (unavailableSet.has(key)) continue;
            }

            // Find a room
            let selectedRoom: (typeof rooms)[number] | undefined;
            for (const room of rooms) {
              if (isUsed(roomSlotUsed, room.id, slot.id)) continue;

              // Room suitability
              if (options.respectRoomSuitability) {
                const suitableSubjects = roomSuitabilityMap.get(room.id);
                if (suitableSubjects && suitableSubjects.size > 0 && !suitableSubjects.has(req.subjectId)) {
                  continue;
                }
              }

              selectedRoom = room;
              break;
            }

            if (!selectedRoom) continue;

            // Place the lesson
            lessonsToCreate.push({
              schoolId,
              academicYearId,
              termId,
              classSectionId: req.classSectionId,
              subjectId: req.subjectId,
              teacherId: teacher.id,
              roomId: selectedRoom.id,
              timeSlotId: slot.id,
            });

            markUsed(teacherSlotUsed, teacher.id, slot.id);
            markUsed(classSlotUsed, req.classSectionId, slot.id);
            markUsed(roomSlotUsed, selectedRoom.id, slot.id);
            scheduled++;
            placed = true;
            break;
          }

          if (placed) break;
        }

        if (!placed) {
          // Could not place this lesson
        }
      }

      if (scheduled < req.weeklyLessonsRequired) {
        unfulfilled.push({
          classSectionId: req.classSectionId,
          classSectionName: req.classSection.name,
          subjectId: req.subjectId,
          subjectName: req.subject.name,
          requiredLessons: req.weeklyLessonsRequired,
          scheduledLessons: scheduled,
          reason: 'No available teacher/room/slot combination',
        });
      }
    }

    // Bulk insert
    if (lessonsToCreate.length > 0) {
      await this.db.lesson.createMany({ data: lessonsToCreate });
    }

    const fulfilledCount = sortedReqs.length - unfulfilled.length;
    return {
      totalLessonsCreated: lessonsToCreate.length,
      totalRequirementsFulfilled: fulfilledCount,
      totalRequirements: sortedReqs.length,
      unfulfilled,
    };
  }

  // ---- Timetable views ----

  async getTimetableByClass(schoolId: string, termId: string, classSectionId: string) {
    const lessons = await this.repo.getTimetableByClass(schoolId, termId, classSectionId);
    const classSection = await this.db.classSection.findUnique({ where: { id: classSectionId } });
    return {
      termId,
      classSectionId,
      classSectionName: classSection?.name ?? '',
      grid: this.buildGrid(lessons),
    };
  }

  async getTimetableByTeacher(schoolId: string, termId: string, teacherId: string) {
    const lessons = await this.repo.getTimetableByTeacher(schoolId, termId, teacherId);
    const teacher = await this.db.teacher.findUnique({ where: { id: teacherId } });
    return {
      termId,
      teacherId,
      teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : '',
      grid: this.buildGrid(lessons),
    };
  }

  async getTimetableByRoom(schoolId: string, termId: string, roomId: string) {
    const lessons = await this.repo.getTimetableByRoom(schoolId, termId, roomId);
    const room = await this.db.room.findUnique({ where: { id: roomId } });
    return {
      termId,
      roomId,
      roomName: room?.name ?? '',
      grid: this.buildGrid(lessons),
    };
  }

  private buildGrid(lessons: Array<{
    id: string;
    timeSlot: { dayOfWeek: number; periodId: string; period: { name: string } };
    subject: { name: string };
    teacher: { firstName: string; lastName: string };
    room: { name: string };
    classSection: { name: string };
  }>): TimetableGrid {
    const grid: TimetableGrid = {};
    for (let d = 0; d <= 6; d++) {
      grid[String(d)] = null;
    }

    for (const lesson of lessons) {
      const day = String(lesson.timeSlot.dayOfWeek);
      if (grid[day] === null) grid[day] = {};
      const dayGrid = grid[day] as Record<string, TimetableLesson | null>;

      dayGrid[lesson.timeSlot.periodId] = {
        lessonId: lesson.id,
        subject: lesson.subject.name,
        teacher: `${lesson.teacher.firstName} ${lesson.teacher.lastName.charAt(0)}.`,
        room: lesson.room.name,
      };
    }

    return grid;
  }

  // ---- Conflict validation ----

  private async validateConflicts(
    schoolId: string,
    teacherId: string,
    classSectionId: string,
    roomId: string,
    timeSlotId: string,
    termId: string,
    subjectId: string,
    excludeId?: string,
  ) {
    // 1. Teacher conflict
    if (await this.repo.hasTeacherConflict(schoolId, teacherId, timeSlotId, termId, excludeId)) {
      throw new AppError('Teacher already has a lesson at this time', 409, 'SCHEDULE_CONFLICT_TEACHER');
    }

    // 2. Class conflict
    if (await this.repo.hasClassConflict(schoolId, classSectionId, timeSlotId, termId, excludeId)) {
      throw new AppError('Class already has a lesson at this time', 409, 'SCHEDULE_CONFLICT_CLASS');
    }

    // 3. Room conflict
    if (await this.repo.hasRoomConflict(schoolId, roomId, timeSlotId, termId, excludeId)) {
      throw new AppError('Room already occupied at this time', 409, 'SCHEDULE_CONFLICT_ROOM');
    }

    // 4. Teacher qualification
    const qualified = await this.db.teacherSubject.findFirst({
      where: { teacherId, subjectId },
    });
    if (!qualified) {
      throw new AppError('Teacher is not qualified for this subject', 422, 'TEACHER_NOT_QUALIFIED');
    }

    // 5. Room suitability
    const suitabilityCount = await this.db.roomSubjectSuitability.count({
      where: { roomId },
    });
    if (suitabilityCount > 0) {
      const suitable = await this.db.roomSubjectSuitability.findFirst({
        where: { roomId, subjectId },
      });
      if (!suitable) {
        throw new AppError('Room is not suitable for this subject', 422, 'ROOM_NOT_SUITABLE');
      }
    }

    // 6. Teacher availability
    const timeSlot = await this.db.timeSlot.findUnique({
      where: { id: timeSlotId },
      include: { period: true },
    });
    if (timeSlot) {
      const unavailable = await this.db.teacherAvailability.findFirst({
        where: {
          teacherId,
          dayOfWeek: timeSlot.dayOfWeek,
          periodId: timeSlot.periodId,
          isAvailable: false,
        },
      });
      if (unavailable) {
        throw new AppError('Teacher is not available at this time', 422, 'TEACHER_NOT_AVAILABLE');
      }
    }
  }
}
