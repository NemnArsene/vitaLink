import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class VitalSignsDto {
  @ApiPropertyOptional()
  @IsOptional()
  temperature?: number;

  @ApiPropertyOptional()
  @IsOptional()
  heartRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  bloodPressureSystolic?: number;

  @ApiPropertyOptional()
  @IsOptional()
  bloodPressureDiastolic?: number;

  @ApiPropertyOptional()
  @IsOptional()
  respiratoryRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  oxygenSaturation?: number;
}

export class CreateConsultationDto {
  @ApiProperty()
  @IsString()
  patientId: string;

  @ApiProperty()
  @IsString()
  patientName: string;

  @ApiProperty()
  @IsString()
  medicalRecordNumber: string;

  @ApiProperty()
  @IsString()
  doctorName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  doctorSpecialty?: string;

  @ApiProperty()
  @IsString()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  anamnesis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diagnostic?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  symptoms?: string[];

  @ApiPropertyOptional({ type: VitalSignsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => VitalSignsDto)
  vitalSigns?: VitalSignsDto;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  prescriptions?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  requestedExams?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  service?: string;
}

export class UpdateConsultationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diagnostic?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  prescriptions?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  requestedExams?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
