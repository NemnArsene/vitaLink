import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [AuditModule, NotificationsModule, ProxyModule],
  controllers: [ApiController],
})
export class ApiModule {}
