import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestTemplateField } from './entities/test-template-field.entity';
import { TestTemplate } from './entities/test-template.entity';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';

@Module({
  imports: [TypeOrmModule.forFeature([TestTemplate, TestTemplateField])],
  controllers: [TestsController],
  providers: [TestsService],
  exports: [TestsService, TypeOrmModule],
})
export class TestsModule {}