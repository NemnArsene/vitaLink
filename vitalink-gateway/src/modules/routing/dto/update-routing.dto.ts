import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class ContractTermsDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  tauxRemboursement: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  delaiTraitement: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  plafondAnnuel: number;
}

export class UpdateRoutingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hospitalId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hospitalName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insuranceProviderId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insuranceProviderName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imsApiUrl?: string;

  @ApiPropertyOptional({ enum: ['actif', 'inactif', 'suspendu'] })
  @IsOptional()
  @IsEnum(['actif', 'inactif', 'suspendu'])
  statut?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  enabledServices?: string[];

  @ApiPropertyOptional({ type: ContractTermsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContractTermsDto)
  contractTerms?: ContractTermsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  priority?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
