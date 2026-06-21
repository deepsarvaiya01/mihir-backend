import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logo } from './entities/logo.entity';
import { LogosService } from './logos.service';
import { LogosController } from './logos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Logo])],
  providers: [LogosService],
  controllers: [LogosController],
  exports: [LogosService],
})
export class LogosModule {}
