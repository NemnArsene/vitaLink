import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'audit_logs' })
export class AuditLog {
  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  entity: string;

  @Prop({ required: true })
  entityId: string;

  @Prop({ required: true })
  actorId: string;

  @Prop({ required: true })
  actorName: string;

  @Prop({ required: true })
  actorRole: string;

  @Prop({ required: true })
  actorEntityType: string;

  @Prop({ type: Object })
  previousState: Record<string, any>;

  @Prop({ type: Object })
  newState: Record<string, any>;

  @Prop({ type: [String] })
  changes: string[];

  @Prop({ required: true })
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop()
  requestId: string;

  @Prop({ default: 'success' })
  status: string;

  @Prop()
  errorMessage: string;

  @Prop()
  duration: number;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
