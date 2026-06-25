import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

interface JwtUser { userId: number; email: string; name: string; role: string }

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiQuery({ name: 'limit', required: false })
  getNotifications(@CurrentUser() user: JwtUser, @Query('limit') limit?: string) {
    return this.service.getForRole(user.role, limit ? Number(limit) : 25);
  }

  @Get('unread-count')
  @ApiQuery({ name: 'sinceId', required: false })
  getUnreadCount(@CurrentUser() user: JwtUser, @Query('sinceId') sinceId?: string) {
    return this.service.getCountSince(user.role, sinceId ? Number(sinceId) : 0).then(count => ({ count }));
  }
}
