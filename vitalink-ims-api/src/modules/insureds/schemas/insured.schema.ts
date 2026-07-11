import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type InsuredDocument = Insured & Document;

@Schema({ timestamps: true, collection: 'insureds' })
export class Insured extends BaseSchema {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  insuredNumber: string;

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

  @Prop({ type: Types.ObjectId, ref: 'Policy' })
  policyId?: Types.ObjectId;

  @Prop({ required: true })
  policyNumber: string;

  @Prop()
  providerName: string;

  @Prop()
  insuranceCardNumber: string;

  @Prop()
  relationToSubscriber: string;

  @Prop({ default: 'actif', enum: ['actif', 'inactif', 'suspendu'] })
  statut: string;

  @Prop({ type: [{ code: String, montantMax: Number, consomme: Number, date: Date }] })
  consommationPlafond: Array<{
    code: string;
    montantMax: number;
    consomme: number;
    date: Date;
  }>;

  @Prop()
  dateAffiliation: Date;

  @Prop()
  dateFinCouverture: Date;

  @Prop({ type: [String] })
  allergies: string[];

  @Prop({ type: [String] })
  antecedents: string[];
}

export const InsuredSchema = SchemaFactory.createForClass(Insured);
