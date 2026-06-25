import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { MailModule } from '../mail/mail.module';
import { PatientTestOrder } from '../orders/entities/patient-test-order.entity';
import { PatientTestResult } from '../orders/entities/patient-test-result.entity';
import { TestTemplateField } from '../tests/entities/test-template-field.entity';
import { Patient } from './entities/patient.entity';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, PatientTestOrder, PatientTestResult, TestTemplateField]),
    AuditLogsModule,
    MailModule,
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [TypeOrmModule],
})


export class PatientsModule {}
