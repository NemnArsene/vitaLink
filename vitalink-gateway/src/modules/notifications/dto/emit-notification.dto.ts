import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class EmitNotificationDto {
  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  data: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entityType?: string;
}
