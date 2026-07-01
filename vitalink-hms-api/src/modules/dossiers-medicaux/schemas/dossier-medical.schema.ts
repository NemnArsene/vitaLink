import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type DossierMedicalDocument = DossierMedical & Document;

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, collection: 'dossiers_medicaux' })
export class Soin {
  @Prop({ required: true, enum: ['médicament', 'procédure', 'analyse'] })
  type: string;

  @Prop({ required: true })
  nom: string;

  @Prop()
  posologie: string;

  @Prop({ required: true })
  réaliséLe: Date;

  @Prop({ required: true })
  réaliséPar: string;
}

export const SoinSchema = SchemaFactory.createForClass(Soin);

@Schema({ timestamps: true, collection: 'dossiers_medicaux' })
export class DossierMedical extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ required: true })
  dateVisite: Date;

  @Prop({ type: { code: String, libelle: String }, required: true })
  diagnostic: {
    code: string;
    libelle: string;
  };

  @Prop({ type: [String], default: [] })
  symptomes: string[];

  @Prop({ type: [SoinSchema], default: [] })
  soins: Soin[];

  @Prop({ required: true })
  acteurId: string;

  @Prop({ required: true, enum: ['Médecin', 'Infirmier', 'Laborantin', 'Pharmacien', 'Agent_accueil', 'Admin_hopital'] })
  rôleActeur: string;

  @Prop()
  notes: string;

  @Prop({ default: 'ouvert', enum: ['ouvert', 'clôturé'] })
  statut: string;
}

export const DossierMedicalSchema = SchemaFactory.createForClass(DossierMedical);
