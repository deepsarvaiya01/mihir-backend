import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { B2bLab } from './entities/b2b-lab.entity';
import { B2bLabsService } from './b2b-labs.service';
import { B2bLabsController } from './b2b-labs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([B2bLab])],
  controllers: [B2bLabsController],
  providers: [B2bLabsService],
  exports: [B2bLabsService],
})
export class B2bLabsModule {}
