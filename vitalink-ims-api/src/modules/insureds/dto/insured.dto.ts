import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsDateString, IsEnum } from 'class-validator';

export class CreateInsuredDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  insuredNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: ['M', 'F', 'OTHER'] })
  @IsOptional()
  @IsEnum(['M', 'F', 'OTHER'])
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsString()
  policyId: string;

  @ApiProperty()
  @IsString()
  policyNumber: string;

  @ApiProperty()
  @IsString()
  providerName: string;

  @ApiProperty()
  @IsString()
  insuranceCardNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relationToSubscriber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateAffiliation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFinCouverture?: string;
}

export class UpdateInsuredDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: ['actif', 'inactif', 'suspendu'] })
  @IsOptional()
  @IsEnum(['actif', 'inactif', 'suspendu'])
  statut?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFinCouverture?: string;
}
