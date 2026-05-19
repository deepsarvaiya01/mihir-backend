import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientTestOrder } from '../orders/entities/patient-test-order.entity';
import { PatientTestResult } from '../orders/entities/patient-test-result.entity';
import { TestTemplateField } from '../tests/entities/test-template-field.entity';
import { Patient } from './entities/patient.entity';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, PatientTestOrder, PatientTestResult, TestTemplateField]),
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [TypeOrmModule],
})


export class PatientsModule {}
