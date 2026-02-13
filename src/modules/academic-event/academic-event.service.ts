import type { AcademicEventRepository } from './academic-event.repository.ts';
import type { CreateAcademicEventInput, UpdateAcademicEventInput, ListAcademicEventsQuery } from './academic-event.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class AcademicEventService {
  private readonly repo: AcademicEventRepository;
  constructor(repo: AcademicEventRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListAcademicEventsQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const event = await this.repo.findById(id);
    if (!event) throw new AppError('Academic event not found', 404, 'ACADEMIC_EVENT_NOT_FOUND');
    return event;
  }

  async create(schoolId: string, input: CreateAcademicEventInput) {
    return this.repo.create({
      school: { connect: { id: schoolId } },
      academicYear: { connect: { id: input.academicYearId } },
      title: input.title,
      description: input.description ?? null,
      eventType: input.eventType,
      startDate: input.startDate,
      endDate: input.endDate,
      isSchoolClosed: input.isSchoolClosed,
    });
  }

  async update(id: string, input: UpdateAcademicEventInput) {
    await this.getById(id);
    const data: Record<string, unknown> = {};
    if (input.title !== undefined) data['title'] = input.title;
    if (input.description !== undefined) data['description'] = input.description;
    if (input.eventType !== undefined) data['eventType'] = input.eventType;
    if (input.startDate !== undefined) data['startDate'] = input.startDate;
    if (input.endDate !== undefined) data['endDate'] = input.endDate;
    if (input.isSchoolClosed !== undefined) data['isSchoolClosed'] = input.isSchoolClosed;
    if (input.academicYearId !== undefined) {
      data['academicYear'] = { connect: { id: input.academicYearId } };
    }
    return this.repo.update(id, data);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repo.delete(id);
  }
}
