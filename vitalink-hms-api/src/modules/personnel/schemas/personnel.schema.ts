import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type PersonnelDocument = Personnel & Document;

@Schema({ timestamps: true, collection: 'personnel' })
export class Personnel extends BaseSchema {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  employeeId: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  service: string;

  @Prop()
  specialty: string;

  @Prop()
  dateEmbauche: Date;

  @Prop()
  dateNaissance: Date;

  @Prop({ enum: ['M', 'F'] })
  gender: string;

  @Prop()
  adresse: string;

  @Prop({ default: 'actif', enum: ['actif', 'inactif', 'conge', 'suspendu'] })
  statut: string;

  @Prop({ type: [{ jour: String, debut: String, fin: String }] })
  planning: Array<{
    jour: string;
    debut: string;
    fin: string;
  }>;

  @Prop({ type: [{ date: Date, type: String, motif: String }] })
  absences: Array<{
    date: Date;
    type: string;
    motif: string;
  }>;

  @Prop()
  numeroSecuriteSociale: string;

  @Prop()
  diplome: string;

  @Prop({ type: [String] })
  certifications: string[];

  @Prop({ default: 25 })
  dailyPatientLimit: number;

  @Prop({ type: 'ObjectId', ref: 'Personnel', default: null })
  reportsTo?: string;

  @Prop()
  notes: string;

  @Prop({ required: true })
  entityId: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];
}

export const PersonnelSchema = SchemaFactory.createForClass(Personnel);
