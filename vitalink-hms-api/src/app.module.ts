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
import { PatientsModule } from './modules/patients/patients.module';
import { BillingModule } from './modules/billing/billing.module';
import { EligibilityModule } from './modules/eligibility/eligibility.module';
import { GatewayClientModule } from './modules/gateway-client/gateway-client.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { TriageModule } from './modules/triage/triage.module';
import { ConsultationsModule } from './modules/consultations/consultations.module';
import { LaboratoryModule } from './modules/laboratory/laboratory.module';
import { HospitalizationModule } from './modules/hospitalization/hospitalization.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { PersonnelModule } from './modules/personnel/personnel.module';
import { TarifsModule } from './modules/tarifs/tarifs.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ImportExportModule } from './modules/import-export/import-export.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DossiersMedicauxModule } from './modules/dossiers-medicaux/dossiers-medicaux.module';
import { WrittenReportsModule } from './modules/written-reports/written-reports.module';
import { AuthModule } from './modules/auth/auth.module';
import { InsuranceModule } from './modules/insurance/insurance.module';

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
    HealthModule,
    PatientsModule,
    BillingModule,
    EligibilityModule,
    GatewayClientModule,
    WebhooksModule,
    TriageModule,
    ConsultationsModule,
    LaboratoryModule,
    HospitalizationModule,
    PrescriptionsModule,
    PersonnelModule,
    TarifsModule,
    MessagingModule,
    ReportsModule,
    ImportExportModule,
    DashboardModule,
    DossiersMedicauxModule,
    WrittenReportsModule,
    AuthModule,
    InsuranceModule,
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
