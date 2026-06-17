import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PolicyDocument = Policy & Document;

@Schema({ timestamps: true, collection: 'policies' })
export class Policy {
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
}

export const PolicySchema = SchemaFactory.createForClass(Policy);
