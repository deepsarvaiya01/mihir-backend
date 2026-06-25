import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { ReportSharesService } from './report-shares.service';

@ApiTags('Report Shares')
@Controller('report-shares')
export class ReportSharesController {
  constructor(private readonly service: ReportSharesService) {}

  /** Protected — create a share token for an order */
  @Post(':orderId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_USER)
  createToken(@Param('orderId') orderId: string) {
    return this.service.createToken(Number(orderId));
  }

  /** Public — fetch report data using a share token (no auth required) */
  @Get(':token')
  getByToken(@Param('token') token: string) {
    return this.service.getReportByToken(token);
  }
}
