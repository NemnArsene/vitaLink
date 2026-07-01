import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateWrittenReportImsDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ description: 'ID du supérieur destinataire' })
  @IsString()
  recipientId: string;
}
