import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsOptional } from 'class-validator';

export class GatewayWebhookDto {
  @ApiProperty({ description: 'Event type (e.g., CLAIM_APPROVED, CLAIM_REJECTED)' })
  @IsString()
  eventType: string;

  @ApiProperty({ description: 'Source service identifier' })
  @IsString()
  source: string;

  @ApiProperty({ description: 'Event payload data' })
  @IsObject()
  payload: Record<string, any>;

  @ApiProperty({ description: 'Event timestamp' })
  @IsOptional()
  @IsString()
  timestamp?: string;

  @ApiProperty({ description: 'Event ID for idempotency' })
  @IsOptional()
  @IsString()
  eventId?: string;
}
