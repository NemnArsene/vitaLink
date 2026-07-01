import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type TriageDocument = Triage & Document;

@Schema({ timestamps: true, collection: 'triages' })
export class Triage extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ required: true })
  patientName: string;

  @Prop({ required: true })
  medicalRecordNumber: string;

  @Prop({ type: Object })
  vitalSigns: {
    temperature: number;
    heartRate: number;
    bloodPressureSystolic: number;
    bloodPressureDiastolic: number;
    respiratoryRate: number;
    oxygenSaturation: number;
    weight: number;
    height: number;
  };

  @Prop({ required: true, enum: ['P1_URGENCE', 'P2_TRES_URGENT', 'P3_URGENT', 'P4_SEMI_URGENT', 'P5_NON_URGENT'] })
  triageLevel: string;

  @Prop()
  chiefComplaint: string;

  @Prop()
  symptoms: string;

  @Prop()
  notes: string;

  @Prop()
  orientation: string;

  @Prop()
  triagedBy: string;

  @Prop()
  triagedAt: Date;

  @Prop()
  seenByDoctor: boolean;

  @Prop()
  seenAt: Date;

  @Prop({ default: 'en_attente', enum: ['en_attente', 'en_cours', 'termine', 'transfert'] })
  statut: string;
}

export const TriageSchema = SchemaFactory.createForClass(Triage);
