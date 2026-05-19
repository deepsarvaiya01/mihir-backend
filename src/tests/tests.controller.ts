import {
  Body, Controller, Delete, Get, Param,
  ParseIntPipe, Patch, Post, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/user.entity';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { UpsertTemplateFieldDto } from './dto/upsert-template-field.dto';
import { TestsService } from './tests.service';

@ApiTags('Test Templates')
@ApiBearerAuth()
@Controller('tests/templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new test template' })
  createTemplate(@Body() createTemplateDto: CreateTemplateDto) {
    return this.testsService.createTemplate(createTemplateDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_USER)
  @ApiOperation({ summary: 'Get all test templates' })
  getTemplates() {
    return this.testsService.getTemplates();
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a test template' })
  updateTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.testsService.updateTemplate(id, updateTemplateDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a test template' })
  deleteTemplate(@Param('id', ParseIntPipe) id: number) {
    return this.testsService.deleteTemplate(id);
  }

  @Post(':id/fields')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Add a field to a template' })
  createTemplateField(
    @Param('id', ParseIntPipe) id: number,
    @Body() upsertTemplateFieldDto: UpsertTemplateFieldDto,
  ) {
    return this.testsService.createTemplateField(id, upsertTemplateFieldDto);
  }

  @Patch(':id/fields/:fieldId')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a template field' })
  updateTemplateField(
    @Param('id', ParseIntPipe) id: number,
    @Param('fieldId', ParseIntPipe) fieldId: number,
    @Body() upsertTemplateFieldDto: UpsertTemplateFieldDto,
  ) {
    return this.testsService.updateTemplateField(id, fieldId, upsertTemplateFieldDto);
  }

  @Delete(':id/fields/:fieldId')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a template field' })
  deleteTemplateField(
    @Param('id', ParseIntPipe) id: number,
    @Param('fieldId', ParseIntPipe) fieldId: number,
  ) {
    return this.testsService.deleteTemplateField(id, fieldId);
  }
}
