import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true, collection: 'messages' })
export class Message {
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

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  parentMessageId: Types.ObjectId;

  @Prop({ type: [String] })
  attachments: string[];

  @Prop({ default: false })
  isUrgent: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
