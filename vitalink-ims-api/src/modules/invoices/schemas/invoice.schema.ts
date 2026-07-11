import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true, collection: 'invoices' })
export class Invoice extends BaseSchema {
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

  @Prop({ default: '' })
  hospitalName: string;

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

  @Prop({ default: 'recue', enum: ['recue', 'en_attente', 'approuvee', 'rejetee', 'litige', 'remboursee'] })
  statut: string;

  @Prop()
  claimId: string;

  @Prop()
  claimNumber: string;

  @Prop()
  submittedAt: Date;

  @Prop()
  processedAt: Date;

  @Prop()
  rejectionReason: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
