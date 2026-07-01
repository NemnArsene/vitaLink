import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Patient, PatientSchema } from '../patients/schemas/patient.schema';
import { Invoice, InvoiceSchema } from '../billing/schemas/invoice.schema';
import { Consultation, ConsultationSchema } from '../consultations/schemas/consultation.schema';
import { Hospitalization, HospitalizationSchema } from '../hospitalization/schemas/hospitalization.schema';
import { Personnel, PersonnelSchema } from '../personnel/schemas/personnel.schema';
import { Triage, TriageSchema } from '../triage/schemas/triage.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Consultation.name, schema: ConsultationSchema },
      { name: Hospitalization.name, schema: HospitalizationSchema },
      { name: Personnel.name, schema: PersonnelSchema },
      { name: Triage.name, schema: TriageSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
