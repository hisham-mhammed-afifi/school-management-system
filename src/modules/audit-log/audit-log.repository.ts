import type { PrismaClient, Prisma } from '../../generated/prisma/client.ts';
import type { ListAuditLogsQuery } from './audit-log.schema.ts';
import { buildPaginatedResult } from '../../shared/utils/pagination.ts';

export class AuditLogRepository {
  private readonly db: PrismaClient;
  constructor(db: PrismaClient) {
    this.db = db;
  }

  async findMany(schoolId: string, query: ListAuditLogsQuery) {
    const { page, limit, sortBy, order, tableName, recordId, userId, action, dateFrom, dateTo } = query;
    const where: Prisma.AuditLogWhereInput = { schoolId };

    if (tableName) where.tableName = tableName;
    if (recordId) where.recordId = recordId;
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const [data, total] = await Promise.all([
      this.db.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      this.db.auditLog.count({ where }),
    ]);

    return buildPaginatedResult(data, total, { page, limit });
  }

  async findById(id: string) {
    return this.db.auditLog.findUnique({ where: { id } });
  }
}
