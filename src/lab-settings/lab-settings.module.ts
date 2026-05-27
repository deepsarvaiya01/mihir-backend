import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabSetting } from './entities/lab-setting.entity';
import { LabSettingsController } from './lab-settings.controller';
import { LabSettingsService } from './lab-settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([LabSetting])],
  controllers: [LabSettingsController],
  providers: [LabSettingsService],
  exports: [LabSettingsService],
})
export class LabSettingsModule {}
