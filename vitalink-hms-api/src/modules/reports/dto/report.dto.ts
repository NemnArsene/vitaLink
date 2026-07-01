import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class GenerateReportDto {
  @ApiProperty({ enum: ['activity', 'billing', 'occupation', 'consultations', 'finances', 'personnel'] })
  @IsEnum(['activity', 'billing', 'occupation', 'consultations', 'finances', 'personnel'])
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  service?: string;

  @ApiPropertyOptional({ enum: ['pdf', 'excel', 'csv'] })
  @IsOptional()
  @IsEnum(['pdf', 'excel', 'csv'])
  format?: string;
}
