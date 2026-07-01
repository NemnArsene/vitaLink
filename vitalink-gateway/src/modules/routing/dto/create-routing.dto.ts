import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
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

export class CreateRoutingDto {
  @ApiProperty()
  @IsString()
  hospitalId: string;

  @ApiProperty()
  @IsString()
  hospitalName: string;

  @ApiProperty()
  @IsString()
  insuranceProviderId: string;

  @ApiProperty()
  @IsString()
  insuranceProviderName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imsApiUrl?: string;

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
