import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class ExportImsDataDto {
  @ApiProperty({ enum: ['polices', 'assures', 'hopitaux'] })
  @IsEnum(['polices', 'assures', 'hopitaux'])
  entity: string;

  @ApiProperty({ enum: ['csv', 'excel'] })
  @IsEnum(['csv', 'excel'])
  format: string;
}

export class ImportImsDataDto {
  @ApiProperty({ enum: ['polices', 'assures', 'hopitaux'] })
  @IsEnum(['polices', 'assures', 'hopitaux'])
  entity: string;

  @ApiProperty()
  @IsString()
  data: string;
}
