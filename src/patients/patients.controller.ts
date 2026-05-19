import {
  Body, Controller, Delete, Get, Param,
  ParseIntPipe, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/user.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { PatientsService } from './patients.service';

@ApiTags('Patients')
@ApiBearerAuth()
@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.LAB_USER)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new patient' })
  createPatient(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.createPatient(createPatientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all patients with optional search' })
  @ApiQuery({ name: 'search', required: false })
  getPatients(@Query('search') search?: string) {
    return this.patientsService.getPatients(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  getPatientById(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.getPatientById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update patient profile' })
  updatePatient(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreatePatientDto>,
  ) {
    return this.patientsService.updatePatient(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a patient' })
  deletePatient(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.deletePatient(id);
  }

  @Get(':id/results-history')
  @ApiOperation({ summary: 'Get full diagnostic history for a patient' })
  getPatientResultHistory(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.getPatientResultHistory(id);
  }
}
