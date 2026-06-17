import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type WebhookEventDocument = WebhookEvent & Document;

@Schema({ timestamps: true, collection: 'webhook_events' })
export class WebhookEvent {
  @Prop({ required: true })
  eventType: string;

  @Prop({ required: true })
  source: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  payload: any;

  @Prop({ default: 'received', enum: ['received', 'processed', 'failed'] })
  status: string;

  @Prop()
  processedAt: Date;

  @Prop()
  error: string;
}

export const WebhookEventSchema = SchemaFactory.createForClass(WebhookEvent);
