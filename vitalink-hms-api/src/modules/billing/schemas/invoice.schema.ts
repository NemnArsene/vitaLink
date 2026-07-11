import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true, collection: 'invoices' })
export class Invoice extends BaseSchema {
  @Prop({ required: true, unique: true })
  invoiceNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

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
  montantRembourse: number;

  @Prop({ default: 'brouillon', enum: ['brouillon', 'soumise', 'en_attente', 'approuvee', 'rejetee', 'remboursee'] })
  statut: string;

  @Prop()
  submittedAt: Date;

  @Prop()
  processedAt: Date;

  @Prop()
  insuranceClaimId: string;

  @Prop()
  rejectionReason: string;

  @Prop()
  insuranceCardNumber: string;

  @Prop()
  insuranceProvider: string;

  @Prop()
  notes: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
