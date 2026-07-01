import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsBoolean, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MedicamentDto {
  @ApiProperty()
  @IsString()
  medicament: string;

  @ApiProperty()
  @IsString()
  dosage: string;

  @ApiProperty()
  @IsString()
  frequence: string;

  @ApiProperty()
  @IsString()
  duree: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructions?: string;
}

export class CreatePrescriptionDto {
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

  @ApiProperty({ type: [MedicamentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicamentDto)
  medicaments: MedicamentDto[];

  @ApiProperty()
  @IsString()
  diagnosis: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validUntil?: string;
}

export class UpdatePrescriptionDto {
  @ApiPropertyOptional({ type: [MedicamentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicamentDto)
  medicaments?: MedicamentDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isValid?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validUntil?: string;
}
