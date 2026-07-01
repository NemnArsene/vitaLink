import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum, IsBoolean } from 'class-validator';

export class CreateLaboratoryDto {
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
  examCode: string;

  @ApiProperty()
  @IsString()
  examName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty()
  @IsString()
  requestedBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sampleType?: string;
}

export class UpdateLaboratoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sampleType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resultValue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resultUnit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resultText?: string;

  @ApiPropertyOptional({ enum: ['en_attente', 'preleve', 'en_cours', 'termine', 'valide'] })
  @IsOptional()
  @IsEnum(['en_attente', 'preleve', 'en_cours', 'termine', 'valide'])
  statut?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  interpretedBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
