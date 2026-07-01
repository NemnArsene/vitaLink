import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type HospitalizationDocument = Hospitalization & Document;

@Schema({ timestamps: true, collection: 'hospitalizations' })
export class Hospitalization extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ required: true })
  patientName: string;

  @Prop({ required: true })
  medicalRecordNumber: string;

  @Prop({ required: true })
  admissionDate: Date;

  @Prop()
  dischargeDate: Date;

  @Prop({ required: true })
  service: string;

  @Prop()
  roomNumber: string;

  @Prop()
  bedNumber: string;

  @Prop()
  admittingDoctor: string;

  @Prop()
  dischargeDoctor: string;

  @Prop({ required: true, enum: ['hospitalise', 'sorti', 'transfere', 'decede'] })
  statut: string;

  @Prop()
  admissionDiagnosis: string;

  @Prop()
  dischargeDiagnosis: string;

  @Prop()
  admissionType: string;

  @Prop({ type: [{ type: String }] })
  treats: string[];

  @Prop({ type: [{ produit: String, quantite: Number, prixUnitaire: Number, date: Date, administeredBy: String }] })
  produitsUtilises: Array<{
    produit: string;
    quantite: number;
    prixUnitaire: number;
    date: Date;
    administeredBy: string;
  }>;

  @Prop({ type: [{ date: Date, soin: String, par: String, notes: String }] })
  soins: Array<{
    date: Date;
    soin: string;
    par: string;
    notes: string;
  }>;

  @Prop({ default: 0 })
  fraisTotal: number;

  @Prop({ type: Object })
  frais: {
    fraisChambre: number;
    fraisSoins: number;
    fraisMedicaments: number;
    fraisExamens: number;
    fraisDivers: number;
  };

  @Prop()
  notes: string;
}

export const HospitalizationSchema = SchemaFactory.createForClass(Hospitalization);
