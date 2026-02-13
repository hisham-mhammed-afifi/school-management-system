import type { AuditLogRepository } from './audit-log.repository.ts';
import type { ListAuditLogsQuery } from './audit-log.schema.ts';
import { AppError } from '../../shared/errors/app-error.ts';

export class AuditLogService {
  private readonly repo: AuditLogRepository;
  constructor(repo: AuditLogRepository) {
    this.repo = repo;
  }

  async list(schoolId: string, query: ListAuditLogsQuery) {
    return this.repo.findMany(schoolId, query);
  }

  async getById(id: string) {
    const log = await this.repo.findById(id);
    if (!log) throw new AppError('Audit log not found', 404, 'AUDIT_LOG_NOT_FOUND');
    return log;
  }
}
