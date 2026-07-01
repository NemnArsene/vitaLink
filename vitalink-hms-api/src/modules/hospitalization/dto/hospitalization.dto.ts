import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, IsDateString, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class ProduitDto {
  @ApiProperty()
  @IsString()
  produit: string;

  @ApiProperty()
  @IsNumber()
  quantite: number;

  @ApiProperty()
  @IsNumber()
  prixUnitaire: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  administeredBy?: string;
}

class SoinDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty()
  @IsString()
  soin: string;

  @ApiProperty()
  @IsString()
  par: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

class FraisDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fraisChambre?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fraisSoins?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fraisMedicaments?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fraisExamens?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fraisDivers?: number;
}

export class CreateHospitalizationDto {
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
  service: string;

  @ApiProperty()
  @IsString()
  admittingDoctor: string;

  @ApiProperty()
  @IsString()
  admissionDiagnosis: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bedNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  admissionType?: string;
}

export class UpdateHospitalizationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  service?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bedNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dischargeDiagnosis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dischargeDoctor?: string;

  @ApiPropertyOptional({ enum: ['hospitalise', 'sorti', 'transfere', 'decede'] })
  @IsOptional()
  @IsEnum(['hospitalise', 'sorti', 'transfere', 'decede'])
  statut?: string;

  @ApiPropertyOptional({ type: [ProduitDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProduitDto)
  produitsUtilises?: ProduitDto[];

  @ApiPropertyOptional({ type: [SoinDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SoinDto)
  soins?: SoinDto[];

  @ApiPropertyOptional({ type: FraisDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FraisDto)
  frais?: FraisDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
