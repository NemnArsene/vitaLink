import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class GarantieDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  libelle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  montantMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pourcentage?: number;
}

export class UpdatePolicyDto {
  @ApiPropertyOptional({ enum: ['active', 'inactive', 'expiree', 'suspendue'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'expiree', 'suspendue'])
  statut?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateDebut?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @ApiPropertyOptional({ type: [GarantieDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GarantieDto)
  garanties?: GarantieDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  monthlyPremium?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  annualPremium?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  coverageAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  remainingCoverage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  deductible?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  commission?: number;

  @ApiPropertyOptional({ enum: ['monthly', 'quarterly', 'annual'] })
  @IsOptional()
  @IsEnum(['monthly', 'quarterly', 'annual'])
  paymentFrequency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  agentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
