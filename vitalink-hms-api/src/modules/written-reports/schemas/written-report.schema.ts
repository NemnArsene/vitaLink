import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { BaseSchema } from '../../../common/schemas/base.schema';

export type WrittenReportDocument = WrittenReport & Document;

@Schema({ timestamps: true, collection: 'written_reports' })
export class WrittenReport extends BaseSchema {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Personnel' })
  authorId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Personnel' })
  recipientId: string;

  @Prop({ default: 'draft', enum: ['draft', 'sent'] })
  status: string;

  @Prop()
  sentAt: Date;
}

export const WrittenReportSchema = SchemaFactory.createForClass(WrittenReport);
