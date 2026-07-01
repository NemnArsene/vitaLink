import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class GenerateImsReportDto {
  @ApiProperty({ enum: ['remboursements', 'litiges', 'plafonds', 'finances', 'hopitaux', 'activite'] })
  @IsEnum(['remboursements', 'litiges', 'plafonds', 'finances', 'hopitaux', 'activite'])
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ enum: ['pdf', 'excel', 'csv'] })
  @IsOptional()
  @IsEnum(['pdf', 'excel', 'csv'])
  format?: string;
}
