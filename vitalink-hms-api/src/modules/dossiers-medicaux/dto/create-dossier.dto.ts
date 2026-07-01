import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsDateString, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class DiagnosticDto {
  @ApiProperty({ example: 'J45', description: 'Code CIM-10' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Asthme', description: 'Libellé du diagnostic' })
  @IsString()
  libelle: string;
}

export class CreateDossierDto {
  @ApiProperty({ description: 'Date de la visite' })
  @IsDateString()
  dateVisite: string;

  @ApiProperty({ type: DiagnosticDto })
  @ValidateNested()
  @Type(() => DiagnosticDto)
  diagnostic: DiagnosticDto;

  @ApiPropertyOptional({ type: [String], example: ['toux', 'fièvre'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symptomes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
