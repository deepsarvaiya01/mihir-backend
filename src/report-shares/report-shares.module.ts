import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportShareToken } from './entities/report-share-token.entity';
import { PatientTestOrder } from '../orders/entities/patient-test-order.entity';
import { ReportSharesController } from './report-shares.controller';
import { ReportSharesService } from './report-shares.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReportShareToken, PatientTestOrder])],
  controllers: [ReportSharesController],
  providers: [ReportSharesService],
  exports: [ReportSharesService],
})
export class ReportSharesModule {}
