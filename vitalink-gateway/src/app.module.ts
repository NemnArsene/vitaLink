import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ScopesGuard } from './common/guards/scopes.guard';
import { ProxyModule } from './modules/proxy/proxy.module';
import { HmsProxyController } from './modules/proxy/hms-proxy.controller';
import { ImsProxyController } from './modules/proxy/ims-proxy.controller';
import { WebhookProxyController } from './modules/proxy/webhook-proxy.controller';

/**
 * VitaLink API Gateway — Stateless Reverse Proxy
 *
 * This Gateway has NO database. It is a pure stateless API gateway that:
 * - Authenticates JWT tokens (stateless verification)
 * - Verifies scopes (hospital vs insurance)
 * - Proxies requests to downstream APIs (HMS:3001, IMS:3002)
 * - Forwards webhooks between services
 *
 * All business data lives in:
 * - HMS API → vitalink_hms_db (patients, invoices, billing)
 * - IMS API → vitalink_ims_db (policies, insurance claims, eligibility)
 */
@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
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
    HealthModule,
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
