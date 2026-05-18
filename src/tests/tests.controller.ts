import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/user.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { UpsertTemplateFieldDto } from './dto/upsert-template-field.dto';
import { TestsService } from './tests.service';

@Controller('tests/templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  createTemplate(@Body() createTemplateDto: CreateTemplateDto) {
    return this.testsService.createTemplate(createTemplateDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_USER)
  getTemplates() {
    return this.testsService.getTemplates();
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  updateTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.testsService.updateTemplate(id, updateTemplateDto);
  }

  @Post(':id/fields')
  @Roles(UserRole.SUPER_ADMIN)
  createTemplateField(
    @Param('id', ParseIntPipe) id: number,
    @Body() upsertTemplateFieldDto: UpsertTemplateFieldDto,
  ) {
    return this.testsService.createTemplateField(id, upsertTemplateFieldDto);
  }

  @Patch(':id/fields/:fieldId')
  @Roles(UserRole.SUPER_ADMIN)
  updateTemplateField(
    @Param('id', ParseIntPipe) id: number,
    @Param('fieldId', ParseIntPipe) fieldId: number,
    @Body() upsertTemplateFieldDto: UpsertTemplateFieldDto,
  ) {
    return this.testsService.updateTemplateField(id, fieldId, upsertTemplateFieldDto);
  }
}
