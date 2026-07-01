import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class VitalSignsDto {
  @ApiProperty()
  @IsNumber()
  temperature: number;

  @ApiProperty()
  @IsNumber()
  heartRate: number;

  @ApiProperty()
  @IsNumber()
  bloodPressureSystolic: number;

  @ApiProperty()
  @IsNumber()
  bloodPressureDiastolic: number;

  @ApiProperty()
  @IsNumber()
  respiratoryRate: number;

  @ApiProperty()
  @IsNumber()
  oxygenSaturation: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  height?: number;
}

export class UpdateTriageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  patientName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  medicalRecordNumber?: string;

  @ApiPropertyOptional({ type: VitalSignsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => VitalSignsDto)
  vitalSigns?: VitalSignsDto;

  @ApiPropertyOptional({ enum: ['P1_URGENCE', 'P2_TRES_URGENT', 'P3_URGENT', 'P4_SEMI_URGENT', 'P5_NON_URGENT'] })
  @IsOptional()
  @IsEnum(['P1_URGENCE', 'P2_TRES_URGENT', 'P3_URGENT', 'P4_SEMI_URGENT', 'P5_NON_URGENT'])
  triageLevel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chiefComplaint?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  symptoms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orientation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  triagedBy?: string;
}

export class CreateTriageDto {
  @ApiProperty()
  @IsString()
  patientId: string;

  @ApiProperty()
  @IsString()
  patientName: string;

  @ApiProperty()
  @IsString()
  medicalRecordNumber: string;

  @ApiProperty({ type: VitalSignsDto })
  @ValidateNested()
  @Type(() => VitalSignsDto)
  vitalSigns: VitalSignsDto;

  @ApiProperty({ enum: ['P1_URGENCE', 'P2_TRES_URGENT', 'P3_URGENT', 'P4_SEMI_URGENT', 'P5_NON_URGENT'] })
  @IsEnum(['P1_URGENCE', 'P2_TRES_URGENT', 'P3_URGENT', 'P4_SEMI_URGENT', 'P5_NON_URGENT'])
  triageLevel: string;

  @ApiProperty()
  @IsString()
  chiefComplaint: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  symptoms?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orientation?: string;

  @ApiProperty()
  @IsString()
  triagedBy: string;
}
