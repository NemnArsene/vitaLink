import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CheckEligibilityDto {
  @ApiProperty({ description: 'Patient medical record number' })
  @IsString()
  patientId: string;

  @ApiPropertyOptional({ description: 'Insurance card number' })
  @IsOptional()
  @IsString()
  insuranceCardNumber?: string;

  @ApiPropertyOptional({ description: 'Date of the service' })
  @IsOptional()
  @IsDateString()
  serviceDate?: string;

  @ApiPropertyOptional({ description: 'Medical act code to check coverage for' })
  @IsOptional()
  @IsString()
  actCode?: string;
}
