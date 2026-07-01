import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type WrittenReportImsDocument = WrittenReportIms & Document;

@Schema({ timestamps: true, collection: 'written_reports_ims' })
export class WrittenReportIms extends BaseSchema {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  authorId: string;

  @Prop({ required: true })
  recipientId: string;

  @Prop({ default: 'draft', enum: ['draft', 'sent'] })
  status: string;

  @Prop()
  sentAt: Date;
}

export const WrittenReportImsSchema = SchemaFactory.createForClass(WrittenReportIms);
