import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  log(opts: {
    userId?: number | null;
    userName: string;
    action: string;
    entityType?: string;
    entityId?: number | null;
    details?: Record<string, unknown>;
  }): void {
    // Fire-and-forget — never await this in callers
    this.repo
      .save(
        this.repo.create({
          userId: opts.userId ?? null,
          userName: opts.userName,
          action: opts.action,
          entityType: opts.entityType ?? null,
          entityId: opts.entityId ?? null,
          details: opts.details ? JSON.stringify(opts.details) : null,
        }),
      )
      .catch(() => {}); // silently ignore DB errors
  }

  async findAll(opts: {
    page?: number;
    limit?: number;
    action?: string;
    entityType?: string;
  }): Promise<{ data: AuditLog[]; total: number }> {
    const page = opts.page ?? 1;
    const limit = Math.min(opts.limit ?? 50, 100);

    const qb = this.repo.createQueryBuilder('a').orderBy('a.created_at', 'DESC');
    if (opts.action) qb.andWhere('a.action ILIKE :action', { action: `%${opts.action}%` });
    if (opts.entityType) qb.andWhere('a.entity_type = :et', { et: opts.entityType });

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }
}
