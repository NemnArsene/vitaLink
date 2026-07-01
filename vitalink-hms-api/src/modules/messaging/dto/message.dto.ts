import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateMessageDto {
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

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  attachments?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentMessageId?: string;
}
