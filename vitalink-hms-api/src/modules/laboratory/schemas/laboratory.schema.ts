import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type LaboratoryDocument = Laboratory & Document;

@Schema({ timestamps: true, collection: 'laboratory' })
export class Laboratory extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ required: true })
  patientName: string;

  @Prop({ required: true })
  medicalRecordNumber: string;

  @Prop({ required: true })
  examCode: string;

  @Prop({ required: true })
  examName: string;

  @Prop()
  category: string;

  @Prop()
  requestedBy: string;

  @Prop()
  requestedAt: Date;

  @Prop()
  sampledAt: Date;

  @Prop()
  sampleType: string;

  @Prop()
  resultValue: string;

  @Prop()
  resultUnit: string;

  @Prop({ type: Object })
  referenceRange: {
    min: number;
    max: number;
    text: string;
  };

  @Prop()
  resultText: string;

  @Prop()
  interpretedBy: string;

  @Prop()
  interpretedAt: Date;

  @Prop({ default: 'en_attente', enum: ['en_attente', 'preleve', 'en_cours', 'termine', 'valide'] })
  statut: string;

  @Prop({ default: false })
  doctorNotified: boolean;

  @Prop()
  notifiedAt: Date;

  @Prop()
  notes: string;
}

export const LaboratorySchema = SchemaFactory.createForClass(Laboratory);
