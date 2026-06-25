import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async create(opts: {
    targetRole: string;
    type: string;
    title: string;
    message: string;
    orderId?: number | null;
  }): Promise<void> {
    await this.repo.save(
      this.repo.create({
        targetRole: opts.targetRole,
        type: opts.type,
        title: opts.title,
        message: opts.message,
        orderId: opts.orderId ?? null,
      }),
    );
  }

  async getForRole(role: string, limit = 25): Promise<Notification[]> {
    return this.repo.find({
      where: [
        { targetRole: role },
        { targetRole: 'ALL' },
      ],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getCountSince(role: string, sinceId: number): Promise<number> {
    return this.repo
      .createQueryBuilder('n')
      .where('(n.target_role = :role OR n.target_role = :all)', { role, all: 'ALL' })
      .andWhere('n.id > :sinceId', { sinceId })
      .getCount();
  }
}
