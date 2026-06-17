import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TokenBlacklistDocument = HydratedDocument<TokenBlacklist>;

@Schema({ collection: 'token_blacklist', timestamps: true, expires: '24h' })
export class TokenBlacklist {
  @Prop({ required: true, index: true })
  jti: string; // JWT ID (sub claim)

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  revokedAt: Date;

  @Prop()
  reason?: string;
}

export const TokenBlacklistSchema = SchemaFactory.createForClass(TokenBlacklist);
TokenBlacklistSchema.index({ jti: 1 });
TokenBlacklistSchema.index({ userId: 1 });
