import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type ConsultationDocument = Consultation & Document;

@Schema({ timestamps: true, collection: 'consultations' })
export class Consultation extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ required: true })
  patientName: string;

  @Prop({ required: true })
  medicalRecordNumber: string;

  @Prop({ required: true })
  doctorName: string;

  @Prop()
  doctorSpecialty: string;

  @Prop()
  reason: string;

  @Prop()
  anamnesis: string;

  @Prop()
  diagnostic: string;

  @Prop({ type: [String] })
  symptoms: string[];

  @Prop({ type: Object })
  vitalSigns: {
    temperature: number;
    heartRate: number;
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    respiratoryRate: number;
    oxygenSaturation: number;
  };

  @Prop({ type: [String] })
  prescriptions: string[];

  @Prop({ type: [String] })
  requestedExams: string[];

  @Prop({ type: [{ code: String, libelle: String, resultat: String, date: Date }] })
  examResults: Array<{
    code: string;
    libelle: string;
    resultat: string;
    date: Date;
  }>;

  @Prop()
  notes: string;

  @Prop()
  consultationDate: Date;

  @Prop()
  service: string;

  @Prop({ default: 'active' })
  status: string;
}

export const ConsultationSchema = SchemaFactory.createForClass(Consultation);
