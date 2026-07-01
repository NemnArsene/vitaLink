import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class ExportDataDto {
  @ApiProperty({ enum: ['patients', 'tarifs', 'personnel', 'factures', 'consultations'] })
  @IsEnum(['patients', 'tarifs', 'personnel', 'factures', 'consultations'])
  entity: string;

  @ApiProperty({ enum: ['csv', 'excel'] })
  @IsEnum(['csv', 'excel'])
  format: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class ImportDataDto {
  @ApiProperty({ enum: ['patients', 'tarifs', 'personnel'] })
  @IsEnum(['patients', 'tarifs', 'personnel'])
  entity: string;

  @ApiProperty()
  @IsString()
  data: string;
}
