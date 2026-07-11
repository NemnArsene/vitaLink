import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type InsuranceContractDocument = InsuranceContract & Document;

@Schema({ timestamps: true, collection: 'insurance_contracts' })
export class InsuranceContract extends BaseSchema {
  @Prop({ required: true })
  contractNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'InsuranceCompany', required: true })
  companyId: Types.ObjectId;

  @Prop()
  companyName: string;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop({ default: 0 })
  coverageRate: number;

  @Prop({ default: 'ACTIVE', enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'] })
  status: string;
}

export const InsuranceContractSchema = SchemaFactory.createForClass(InsuranceContract);
