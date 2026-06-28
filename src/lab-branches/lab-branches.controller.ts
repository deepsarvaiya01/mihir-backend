import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/user.entity';
import { LabBranchesService } from './lab-branches.service';
import { CreateLabBranchDto } from './dto/create-lab-branch.dto';

@ApiTags('Lab Branches')
@ApiBearerAuth()
@Controller('lab-branches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LabBranchesController {
  constructor(private readonly service: LabBranchesService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_USER)
  @ApiOperation({ summary: 'Get all lab branches' })
  getAll() { return this.service.getAll(); }

  @Get('archived')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get archived lab branches' })
  getArchived() { return this.service.getArchived(); }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create lab branch' })
  create(@Body() dto: CreateLabBranchDto) { return this.service.create(dto); }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update lab branch' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateLabBranchDto>) { return this.service.update(id, dto); }

  @Patch(':id/restore')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Restore a soft-deleted lab branch' })
  restore(@Param('id', ParseIntPipe) id: number) { return this.service.restore(id); }

  @Delete(':id/permanent')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Permanently delete a lab branch' })
  permanentlyDelete(@Param('id', ParseIntPipe) id: number) { return this.service.permanentlyDelete(id); }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Soft delete lab branch' })
  delete(@Param('id', ParseIntPipe) id: number) { return this.service.delete(id); }
}
