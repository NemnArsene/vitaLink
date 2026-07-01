import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Patient, PatientSchema } from '../patients/schemas/patient.schema';
import { Invoice, InvoiceSchema } from '../billing/schemas/invoice.schema';
import { Consultation, ConsultationSchema } from '../consultations/schemas/consultation.schema';
import { Hospitalization, HospitalizationSchema } from '../hospitalization/schemas/hospitalization.schema';
import { Personnel, PersonnelSchema } from '../personnel/schemas/personnel.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Consultation.name, schema: ConsultationSchema },
      { name: Hospitalization.name, schema: HospitalizationSchema },
      { name: Personnel.name, schema: PersonnelSchema },

    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
