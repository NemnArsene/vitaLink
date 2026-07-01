import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type PartnerHospitalDocument = PartnerHospital & Document;

@Schema({ timestamps: true, collection: 'partner_hospitals' })
export class PartnerHospital extends BaseSchema {
  @Prop({ required: true, unique: true })
  hospitalCode: string;

  @Prop({ required: true })
  hospitalName: string;

  @Prop()
  address: string;

  @Prop()
  city: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop()
  directorName: string;

  @Prop({ default: 'actif', enum: ['actif', 'inactif', 'suspendu'] })
  statut: string;

  @Prop({ type: Object })
  convention: {
    number: string;
    startDate: Date;
    endDate: Date;
    tauxRemboursement: number;
    conditionsPaiement: string;
  };

  @Prop({ type: [{ service: String, tauxRemboursement: Number, plafond: Number }] })
  tarifsConventionnes: Array<{
    service: string;
    tauxRemboursement: number;
    plafond: number;
  }>;

  @Prop()
  dateAgrement: Date;

  @Prop({ type: [String] })
  servicesDisponibles: string[];

  @Prop()
  niveau: string;

  @Prop()
  capaciteLits: number;

  @Prop()
  notes: string;
}

export const PartnerHospitalSchema = SchemaFactory.createForClass(PartnerHospital);
