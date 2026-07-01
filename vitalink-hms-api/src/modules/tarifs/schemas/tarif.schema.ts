import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type TarifDocument = Tarif & Document;

@Schema({ timestamps: true, collection: 'tarifs' })
export class Tarif extends BaseSchema {
  @Prop({ required: true })
  acteCode: string;

  @Prop({ required: true })
  acteName: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  montant: number;

  @Prop()
  pourcentageAssurance: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  validFrom: Date;

  @Prop()
  validUntil: Date;

  @Prop()
  service: string;
}

export const TarifSchema = SchemaFactory.createForClass(Tarif);
