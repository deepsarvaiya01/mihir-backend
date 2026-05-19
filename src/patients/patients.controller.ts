import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/user.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { PatientsService } from './patients.service';

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.LAB_USER)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  createPatient(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.createPatient(createPatientDto);
  }

  @Get('')
  getPatients() {
    return this.patientsService.getPatients();
  }

  @Get(':id/results-history')
  getPatientResultHistory(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.getPatientResultHistory(id);
  }
}
