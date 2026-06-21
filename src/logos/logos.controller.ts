import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/user.entity';
import { CreateLogoDto } from './dto/create-logo.dto';
import { LogosService } from './logos.service';

@ApiTags('Logos')
@ApiBearerAuth()
@Controller('logos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.LAB_USER)
export class LogosController {
  constructor(private readonly logosService: LogosService) {}

  @Get()
  @ApiOperation({ summary: 'Get all logos' })
  getAll() {
    return this.logosService.getAll();
  }

  // Must be declared before /:id to avoid "active" being parsed as an id
  @Get('active')
  @ApiOperation({ summary: 'Get the currently active logo' })
  getActive() {
    return this.logosService.getActive();
  }

  @Patch('deactivate-all')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Remove active status from all logos' })
  deactivateAll() {
    return this.logosService.deactivateAll();
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Upload a new logo' })
  create(@Body() dto: CreateLogoDto) {
    return this.logosService.create(dto);
  }

  @Patch(':id/activate')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Set a logo as the active one' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.logosService.activate(id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a logo' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.logosService.delete(id);
  }
}
