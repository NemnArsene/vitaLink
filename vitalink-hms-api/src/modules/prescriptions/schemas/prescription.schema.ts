import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type PrescriptionDocument = Prescription & Document;

@Schema({ timestamps: true, collection: 'prescriptions' })
export class Prescription extends BaseSchema {
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
  prescriptionDate: Date;

  @Prop({ type: [{ medicament: String, dosage: String, frequence: String, duree: String, instructions: String }] })
  medicaments: Array<{
    medicament: string;
    dosage: string;
    frequence: string;
    duree: string;
    instructions: string;
  }>;

  @Prop()
  diagnosis: string;

  @Prop()
  notes: string;

  @Prop()
  isValid: boolean;

  @Prop()
  validUntil: Date;
}

export const PrescriptionSchema = SchemaFactory.createForClass(Prescription);
