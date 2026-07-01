import { Controller, Post, Get, Param, Sse, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { NotificationsService, SseMessage } from './notifications.service';
import { Scopes } from '../../common/decorators/roles.decorator';
import { Scope } from '../../common/enums/roles.enum';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { EmitNotificationDto } from './dto/emit-notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('subscribe')
  @Sse()
  @ApiOperation({ summary: 'Subscribe to real-time notifications via SSE' })
  subscribe(
    @Query('userId') userId?: string,
    @Query('token') token?: string,
  ): Observable<SseMessage> {
    let sub = userId;
    if (!sub && token) {
      try {
        const decoded = this.jwtService.verify(token);
        sub = decoded.sub;
      } catch {}
    }
    return this.notificationsService.subscribe(sub || 'anonymous');
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @Post('emit')
  @Scopes(Scope.ADMIN)
  @ApiOperation({ summary: 'Emit a notification event (admin only)' })
  emit(@Body() dto: EmitNotificationDto) {
    this.notificationsService.emit(dto);
    return { success: true };
  }
}
