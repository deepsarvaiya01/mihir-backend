import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestTemplateField } from './entities/test-template-field.entity';
import { TestTemplate } from './entities/test-template.entity';
import { TestTemplateB2bPrice } from './entities/test-template-b2b-price.entity';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';

@Module({
  imports: [TypeOrmModule.forFeature([TestTemplate, TestTemplateField, TestTemplateB2bPrice])],
  controllers: [TestsController],
  providers: [TestsService],
  exports: [TestsService, TypeOrmModule],
})
export class TestsModule {}
