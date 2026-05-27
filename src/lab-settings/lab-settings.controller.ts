import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { LabSettingsService } from './lab-settings.service';

@Controller('lab-settings')
@UseGuards(JwtAuthGuard)
export class LabSettingsController {
  constructor(private readonly service: LabSettingsService) {}

  /** Returns all lab settings as a flat key-value object */
  @Get()
  getAll() {
    return this.service.getAll();
  }

  /** Batch-upsert lab settings (SUPER_ADMIN only) */
  @Put()
  @Roles(UserRole.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  update(@Body() body: Record<string, string>) {
    return this.service.upsertMany(body);
  }
}
