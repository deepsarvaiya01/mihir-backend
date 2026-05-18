import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { TestTemplateField } from '../tests/entities/test-template-field.entity';
import { TestTemplate } from '../tests/entities/test-template.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PatientTestOrder } from './entities/patient-test-order.entity';
import { PatientTestResult } from './entities/patient-test-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PatientTestOrder,
      PatientTestResult,
      Patient,
      TestTemplate,
      TestTemplateField,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
