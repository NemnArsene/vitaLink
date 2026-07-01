import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateMessageImsDto {
  @ApiProperty()
  @IsString()
  senderId: string;

  @ApiProperty()
  @IsString()
  senderName: string;

  @ApiProperty()
  @IsString()
  senderRole: string;

  @ApiProperty()
  @IsString()
  receiverId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receiverName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentMessageId?: string;
}
