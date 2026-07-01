import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageImsDocument = MessageIms & Document;

@Schema({ timestamps: true, collection: 'messages_ims' })
export class MessageIms {
  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  senderName: string;

  @Prop({ required: true })
  senderRole: string;

  @Prop({ required: true })
  receiverId: string;

  @Prop()
  receiverName: string;

  @Prop()
  subject: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  readAt: Date;

  @Prop({ default: 'inbox', enum: ['inbox', 'sent', 'archived', 'deleted'] })
  folder: string;

  @Prop({ default: false })
  isUrgent: boolean;

  @Prop({ type: Types.ObjectId, ref: 'MessageIms' })
  parentMessageId: Types.ObjectId;

  @Prop({ type: [String] })
  attachments: string[];
}

export const MessageImsSchema = SchemaFactory.createForClass(MessageIms);
