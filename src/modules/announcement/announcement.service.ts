import type { AnnouncementRepository } from './announcement.repository.ts';
import type { CreateAnnouncementInput, UpdateAnnouncementInput, ListAnnouncementsQuery } from './announcement.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class AnnouncementService {
  private readonly repo: AnnouncementRepository;
  constructor(repo: AnnouncementRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListAnnouncementsQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const announcement = await this.repo.findById(id);
    if (!announcement) throw new AppError('Announcement not found', 404, 'ANNOUNCEMENT_NOT_FOUND');
    return announcement;
  }

  async create(schoolId: string, publishedBy: string, input: CreateAnnouncementInput) {
    return this.repo.create({
      schoolId,
      publishedBy,
      title: input.title,
      body: input.body,
      expiresAt: input.expiresAt,
      targets: input.targets,
    });
  }

  async update(id: string, input: UpdateAnnouncementInput) {
    const existing = await this.getById(id);
    if (!existing.isDraft) {
      throw new AppError('Cannot update a published announcement', 400, 'ANNOUNCEMENT_PUBLISHED');
    }
    return this.repo.update(id, {
      title: input.title,
      body: input.body,
      expiresAt: input.expiresAt,
      targets: input.targets,
    });
  }

  async publish(id: string) {
    const existing = await this.getById(id);
    if (!existing.isDraft) {
      throw new AppError('Announcement is already published', 400, 'ALREADY_PUBLISHED');
    }
    return this.repo.publish(id);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repo.delete(id);
  }
}
