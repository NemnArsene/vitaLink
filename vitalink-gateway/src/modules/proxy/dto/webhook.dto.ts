import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class WebhookDto {
  @ApiProperty()
  @IsString()
  eventType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty()
  data: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timestamp?: string;
}
