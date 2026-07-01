import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({ collection: 'refresh_tokens', timestamps: true })
export class RefreshToken {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  tokenHash: string; // bcrypt hash of the refresh token

  @Prop({ required: true })
  expiresAt: Date;

  @Prop()
  revokedAt?: Date;

  @Prop()
  replacedByTokenId?: string; // For token rotation tracking

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  userAgent?: string;

  @Prop()
  ip?: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
RefreshTokenSchema.index({ userId: 1, isActive: 1 });
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
