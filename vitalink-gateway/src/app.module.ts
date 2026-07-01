import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ScopesGuard } from './common/guards/scopes.guard';
import { ProxyModule } from './modules/proxy/proxy.module';
import { HmsProxyController } from './modules/proxy/hms-proxy.controller';
import { ImsProxyController } from './modules/proxy/ims-proxy.controller';
import { WebhookProxyController } from './modules/proxy/webhook-proxy.controller';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { RoutingModule } from './modules/routing/routing.module';
import { PilotageModule } from './modules/pilotage/pilotage.module';
import { ApiModule } from './modules/api/api.module';
import { MonitoringModule } from './modules/monitoring/monitoring.module';


/**
 * VitaLink API Gateway — Central Orchestration Layer
 *
 * This Gateway has MongoDB only for audit logs, routing config, and notifications.
 * It acts as:
 * - Authentication proxy (stateless JWT verification)
 * - Scope verification (hospital vs insurance)
 * - Multi-partner routing engine
 * - Real-time notification broker (SSE)
 * - Append-only audit trail
 * - Cross-platform pilotage dashboard
 *
 * All business data lives in:
 * - HMS API → vitalink_hms_db (patients, invoices, consultations, etc.)
 * - IMS API → vitalink_ims_db (policies, claims, insureds, etc.)
 */
@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),

    // MongoDB (for audit, routing, notifications)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017'),
        dbName: configService.get<string>('MONGODB_DB_NAME', 'vitalink_gateway_db'),
      }),
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('THROTTLE_TTL', 60000),
            limit: configService.get<number>('THROTTLE_LIMIT', 100),
          },
        ],
      }),
    }),

    // Proxy to downstream APIs (HMS & IMS)
    ProxyModule,

    // Feature Modules
    AuthModule,
    NotificationsModule,
    AuditModule,
    RoutingModule,
    PilotageModule,
    ApiModule,
    MonitoringModule,
  ],
  controllers: [HmsProxyController, ImsProxyController, WebhookProxyController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ScopesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}