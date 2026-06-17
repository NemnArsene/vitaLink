import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { HealthModule } from './modules/health/health.module';
import { PatientsModule } from './modules/patients/patients.module';
import { BillingModule } from './modules/billing/billing.module';
import { EligibilityModule } from './modules/eligibility/eligibility.module';
import { GatewayClientModule } from './modules/gateway-client/gateway-client.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),

    // MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('app.mongodb.uri'),
        dbName: configService.get<string>('app.mongodb.dbName'),
      }),
    }),

    // Feature Modules
    HealthModule,
    PatientsModule,
    BillingModule,
    EligibilityModule,
    GatewayClientModule,
    WebhooksModule,
  ],
})
export class AppModule {}
