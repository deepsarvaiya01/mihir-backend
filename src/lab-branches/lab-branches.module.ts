import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabBranch } from './entities/lab-branch.entity';
import { LabBranchesService } from './lab-branches.service';
import { LabBranchesController } from './lab-branches.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LabBranch])],
  controllers: [LabBranchesController],
  providers: [LabBranchesService],
  exports: [LabBranchesService],
})
export class LabBranchesModule {}
