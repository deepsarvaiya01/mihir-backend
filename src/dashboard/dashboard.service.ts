import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { OrderStatus, PatientTestOrder } from '../orders/entities/patient-test-order.entity';
import { TestTemplate } from '../tests/entities/test-template.entity';
import { User, UserRole } from '../users/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(TestTemplate)
    private readonly templatesRepository: Repository<TestTemplate>,
    @InjectRepository(Patient)
    private readonly patientsRepository: Repository<Patient>,
    @InjectRepository(PatientTestOrder)
    private readonly ordersRepository: Repository<PatientTestOrder>,
  ) {}

  async getTrends(): Promise<{ month: string; orders: number; revenue: number; approved: number }[]> {
    const since = new Date();
    since.setMonth(since.getMonth() - 5);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const rows = await this.ordersRepository
      .createQueryBuilder('o')
      .select("TO_CHAR(DATE_TRUNC('month', o.created_at), 'Mon YY')", 'month')
      .addSelect("TO_CHAR(DATE_TRUNC('month', o.created_at), 'YYYY-MM')", 'key')
      .addSelect('COUNT(*)::int', 'orders')
      .addSelect('COALESCE(SUM(o.net_amount), 0)::float', 'revenue')
      .addSelect("COUNT(*) FILTER (WHERE o.status = 'APPROVED')::int", 'approved')
      .where('o.created_at >= :since', { since })
      .groupBy("DATE_TRUNC('month', o.created_at)")
      .orderBy("DATE_TRUNC('month', o.created_at)", 'ASC')
      .getRawMany<{ month: string; key: string; orders: number; revenue: number; approved: number }>();

    return rows.map(r => ({
      month: r.month,
      orders: Number(r.orders),
      revenue: Number(r.revenue),
      approved: Number(r.approved),
    }));
  }

  async getSummary() {
    const [superAdmins, labUsers, templates, activeTemplates, patients, orders, approvedOrders] =
      await Promise.all([
        this.usersRepository.count({ where: { role: UserRole.SUPER_ADMIN } }),
        this.usersRepository.count({ where: { role: UserRole.LAB_USER } }),
        this.templatesRepository.count(),
        this.templatesRepository.count({ where: { active: true } }),
        this.patientsRepository.count(),
        this.ordersRepository.count(),
        this.ordersRepository.count({ where: { status: OrderStatus.APPROVED } }),
      ]);

    return {
      superAdmins,
      labUsers,
      templates,
      activeTemplates,
      patients,
      orders,
      completedOrders: approvedOrders,
      pendingOrders: Math.max(orders - approvedOrders, 0),
    };
  }
}
