import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';

export class CreateTarifDto {
  @ApiProperty()
  @IsString()
  acteCode: string;

  @ApiProperty()
  @IsString()
  acteName: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  montant: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pourcentageAssurance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  service?: string;
}

export class UpdateTarifDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  acteCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  acteName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  montant?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  pourcentageAssurance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  service?: string;
}
