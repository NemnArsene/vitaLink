import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import configuration from './config/configuration';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { HealthModule } from './modules/health/health.module';
import { PoliciesModule } from './modules/policies/policies.module';
import { ClaimsProcessingModule } from './modules/claims-processing/claims-processing.module';
import { EligibilityProviderModule } from './modules/eligibility-provider/eligibility-provider.module';
import { GatewayClientModule } from './modules/gateway-client/gateway-client.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { InsuredsModule } from './modules/insureds/insureds.module';
import { PartnerHospitalsModule } from './modules/partner-hospitals/partner-hospitals.module';
import { ReportsImsModule } from './modules/reports-ims/reports-ims.module';
import { ImportExportImsModule } from './modules/import-export-ims/import-export-ims.module';
import { MessagingImsModule } from './modules/messaging-ims/messaging-ims.module';
import { AuthModule } from './modules/auth/auth.module';
import { WrittenReportsImsModule } from './modules/written-reports-ims/written-reports-ims.module';
import { InvoicesModule } from './modules/invoices/invoice.module';

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

    // Auth
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Feature Modules
    AuthModule,
    HealthModule,
    PoliciesModule,
    ClaimsProcessingModule,
    EligibilityProviderModule,
    GatewayClientModule,
    WebhooksModule,
    InsuredsModule,
    PartnerHospitalsModule,
    ReportsImsModule,
    ImportExportImsModule,
    MessagingImsModule,
    WrittenReportsImsModule,
    InvoicesModule,
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
