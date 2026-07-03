import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type PatientDocument = Patient & Document;

@Schema({ timestamps: true, collection: 'patients' })
export class Patient extends BaseSchema {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  medicalRecordNumber: string;

  @Prop()
  dateOfBirth: Date;

  @Prop({ enum: ['M', 'F', 'OTHER'] })
  gender: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop({ type: Object })
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };

  @Prop({ type: Object })
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };

  @Prop()
  bloodType: string;

  @Prop({ type: [String] })
  allergies: string[];

  @Prop({ type: [String] })
  antecedents: string[];

  @Prop()
  insuranceCardNumber: string;

  @Prop()
  insuranceProvider: string;

  @Prop({ default: 'EN_ATTENTE', enum: ['ASSURE', 'NON_ASSURE', 'EN_ATTENTE'] })
  insuranceStatus: string;

  @Prop({ default: 0 })
  insuranceCoveragePercentage: number;

  @Prop({ default: 'active', enum: ['active', 'inactive', 'deceased'] })
  status: string;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
