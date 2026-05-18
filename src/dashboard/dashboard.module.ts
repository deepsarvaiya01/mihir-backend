import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { PatientTestOrder } from '../orders/entities/patient-test-order.entity';
import { TestTemplate } from '../tests/entities/test-template.entity';
import { User } from '../users/user.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, TestTemplate, Patient, PatientTestOrder])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
