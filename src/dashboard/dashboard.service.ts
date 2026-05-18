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

  async getSummary() {
    const [superAdmins, labUsers, templates, activeTemplates, patients, orders, completedOrders] =
      await Promise.all([
        this.usersRepository.count({ where: { role: UserRole.SUPER_ADMIN } }),
        this.usersRepository.count({ where: { role: UserRole.LAB_USER } }),
        this.templatesRepository.count(),
        this.templatesRepository.count({ where: { active: true } }),
        this.patientsRepository.count(),
        this.ordersRepository.count(),
        this.ordersRepository.count({ where: { status: OrderStatus.COMPLETED } }),
      ]);

    return {
      superAdmins,
      labUsers,
      templates,
      activeTemplates,
      patients,
      orders,
      completedOrders,
      pendingOrders: Math.max(orders - completedOrders, 0),
    };
  }
}
