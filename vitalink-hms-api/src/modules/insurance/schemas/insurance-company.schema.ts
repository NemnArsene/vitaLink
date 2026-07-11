import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type InsuranceCompanyDocument = InsuranceCompany & Document;

@Schema({ timestamps: true, collection: 'insurance_companies' })
export class InsuranceCompany extends BaseSchema {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop()
  apiEndpoint: string;

  @Prop({ default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'] })
  status: string;

  @Prop()
  contactEmail: string;

  @Prop()
  contactPhone: string;
}

export const InsuranceCompanySchema = SchemaFactory.createForClass(InsuranceCompany);
