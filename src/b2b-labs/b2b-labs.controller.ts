import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/user.entity';
import { B2bLabsService } from './b2b-labs.service';
import { CreateB2bLabDto } from './dto/create-b2b-lab.dto';

@ApiTags('B2B Labs')
@ApiBearerAuth()
@Controller('b2b-labs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class B2bLabsController {
  constructor(private readonly service: B2bLabsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_USER)
  @ApiOperation({ summary: 'Get all B2B labs' })
  getAll() { return this.service.getAll(); }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create B2B lab' })
  create(@Body() dto: CreateB2bLabDto) { return this.service.create(dto); }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update B2B lab' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateB2bLabDto>) { return this.service.update(id, dto); }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete B2B lab' })
  delete(@Param('id', ParseIntPipe) id: number) { return this.service.delete(id); }
}
