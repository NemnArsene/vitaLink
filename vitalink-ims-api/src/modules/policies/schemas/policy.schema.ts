import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type PolicyDocument = Policy & Document;

@Schema({ timestamps: true, collection: 'policies' })
export class Policy extends BaseSchema {
  @Prop({ required: true, unique: true })
  policyNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Subscriber', required: true })
  subscriberId: Types.ObjectId;

  @Prop({ required: true })
  subscriberName: string;

  @Prop({ required: true })
  insuranceProviderId: string;

  @Prop({ required: true })
  providerName: string;

  @Prop({ required: true })
  insuranceCardNumber: string;

  @Prop({ required: true, enum: ['individuelle', 'familiale', 'entreprise'] })
  type: string;

  @Prop({ required: true, enum: ['active', 'inactive', 'expiree', 'suspendue'] })
  statut: string;

  @Prop()
  dateDebut: Date;

  @Prop()
  dateFin: Date;

  @Prop({ type: [{ code: String, libelle: String, montantMax: Number, pourcentage: Number }] })
  garanties: Array<{
    code: string;
    libelle: string;
    montantMax: number;
    pourcentage: number;
  }>;

  @Prop({ type: Object })
  adresse: {
    rue: string;
    ville: string;
    codePostal: string;
  };

  @Prop()
  telephone: string;

  @Prop()
  email: string;

  @Prop({ default: 0 })
  monthlyPremium: number;

  @Prop({ default: 0 })
  annualPremium: number;

  @Prop({ default: 5000000 })
  coverageAmount: number;

  @Prop({ default: 5000000 })
  remainingCoverage: number;

  @Prop({ default: 0 })
  deductible: number;

  @Prop({ default: 0 })
  commission: number;

  @Prop({ default: 'monthly', enum: ['monthly', 'quarterly', 'annual'] })
  paymentFrequency: string;

  @Prop()
  agentId: string;

  @Prop()
  notes: string;
}

export const PolicySchema = SchemaFactory.createForClass(Policy);
