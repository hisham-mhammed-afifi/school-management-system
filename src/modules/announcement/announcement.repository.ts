import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListAnnouncementsQuery } from './announcement.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class AnnouncementRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  private readonly includeTargets = {
    targets: {
      include: {
        targetRole: true,
        targetGrade: true,
        targetClassSection: true,
      },
    },
    publishedByUser: { select: { id: true, fullName: true, email: true } },
  } as const;

  async findMany(schoolId: string, query: ListAnnouncementsQuery) {
    const { page, limit, sortBy, order, isDraft, targetType } = query;
    const where: Prisma.AnnouncementWhereInput = { schoolId };

    if (isDraft !== undefined) where.isDraft = isDraft;
    if (targetType) {
      where.targets = { some: { targetType } };
    }

    const [data, total] = await Promise.all([
      this.db.announcement.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
        include: this.includeTargets,
      }),
      this.db.announcement.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.announcement.findUnique({
      where: { id },
      include: this.includeTargets,
    });
  }

  async create(data: {
    schoolId: string;
    publishedBy: string;
    title: string;
    body: string;
    expiresAt?: Date;
    targets: Array<{
      targetType: string;
      targetRoleId?: string;
      targetGradeId?: string;
      targetClassSectionId?: string;
    }>;
  }) {
    return this.db.announcement.create({
      data: {
        school: { connect: { id: data.schoolId } },
        publishedByUser: { connect: { id: data.publishedBy } },
        title: data.title,
        body: data.body,
        expiresAt: data.expiresAt ?? null,
        targets: {
          create: data.targets.map((t) => ({
            targetType: t.targetType as 'all' | 'role' | 'grade' | 'class_section',
            targetRoleId: t.targetRoleId ?? null,
            targetGradeId: t.targetGradeId ?? null,
            targetClassSectionId: t.targetClassSectionId ?? null,
          })),
        },
      },
      include: this.includeTargets,
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      body?: string;
      expiresAt?: Date | null;
      targets?: Array<{
        targetType: string;
        targetRoleId?: string;
        targetGradeId?: string;
        targetClassSectionId?: string;
      }>;
    },
  ) {
    return this.db.$transaction(async (tx) => {
      if (data.targets) {
        await tx.announcementTarget.deleteMany({ where: { announcementId: id } });
      }

      const updateData: Prisma.AnnouncementUpdateInput = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.body !== undefined) updateData.body = data.body;
      if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt;
      if (data.targets) {
        updateData.targets = {
          create: data.targets.map((t) => ({
            targetType: t.targetType as 'all' | 'role' | 'grade' | 'class_section',
            targetRoleId: t.targetRoleId ?? null,
            targetGradeId: t.targetGradeId ?? null,
            targetClassSectionId: t.targetClassSectionId ?? null,
          })),
        };
      }

      return tx.announcement.update({
        where: { id },
        data: updateData,
        include: this.includeTargets,
      });
    });
  }

  async publish(id: string) {
    return this.db.announcement.update({
      where: { id },
      data: { isDraft: false, publishedAt: new Date() },
      include: this.includeTargets,
    });
  }

  async delete(id: string) {
    return this.db.announcement.delete({ where: { id } });
  }
}
