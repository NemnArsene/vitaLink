import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type InsuranceClaimDocument = InsuranceClaim & Document;

@Schema({ timestamps: true, collection: 'insurance_claims' })
export class InsuranceClaim extends BaseSchema {
  @Prop({ required: true, unique: true })
  claimNumber: string;

  @Prop({ required: true })
  invoiceId: string;

  @Prop({ required: true })
  invoiceNumber: string;

  @Prop({ required: true })
  patientId: string;

  @Prop({ required: true })
  patientName: string;

  @Prop({ required: true })
  hospitalId: string;

  @Prop({ type: [{ acte: String, code: String, description: String, montant: Number, dateActe: Date }] })
  actes: Array<{
    acte: string;
    code: string;
    description: string;
    montant: number;
    dateActe: Date;
  }>;

  @Prop({ required: true })
  montantTotal: number;

  @Prop({ default: 0 })
  montantApprouve: number;

  @Prop({ default: 'recue', enum: ['recue', 'en_revision', 'approuvee', 'rejetee', 'remboursee'] })
  statut: string;

  @Prop()
  reviewedAt: Date;

  @Prop()
  reviewedBy: string;

  @Prop()
  rejectionReason: string;

  @Prop()
  notes: string;
}

export const InsuranceClaimSchema = SchemaFactory.createForClass(InsuranceClaim);
