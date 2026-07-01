import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsDateString, IsEnum, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class GarantieDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  libelle: string;

  @ApiProperty()
  @IsNumber()
  montantMax: number;

  @ApiProperty()
  @IsNumber()
  pourcentage: number;
}

export class CreatePolicyDto {
  @ApiProperty()
  @IsString()
  policyNumber: string;

  @ApiProperty()
  @IsString()
  subscriberId: string;

  @ApiProperty()
  @IsString()
  subscriberName: string;

  @ApiProperty()
  @IsString()
  insuranceProviderId: string;

  @ApiProperty()
  @IsString()
  providerName: string;

  @ApiProperty()
  @IsString()
  insuranceCardNumber: string;

  @ApiProperty({ enum: ['individuelle', 'familiale', 'entreprise'] })
  @IsEnum(['individuelle', 'familiale', 'entreprise'])
  type: string;

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
}
