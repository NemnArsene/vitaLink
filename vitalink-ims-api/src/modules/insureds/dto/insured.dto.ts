import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsDateString, IsEnum } from 'class-validator';

export class CreateInsuredDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insuredNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  policyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  policyNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  providerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insuranceCardNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relationToSubscriber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dateAffiliation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dateFinCouverture?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  socialSecurityNumber?: string;

  @ApiPropertyOptional({ enum: ['active', 'suspended', 'terminated', 'pending'] })
  @IsOptional()
  @IsEnum(['active', 'suspended', 'terminated', 'pending'])
  status?: string;
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
  @IsString()
  dateFinCouverture?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiPropertyOptional({ enum: ['M', 'F', 'OTHER'] })
  @IsOptional()
  @IsEnum(['M', 'F', 'OTHER'])
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  socialSecurityNumber?: string;

  @ApiPropertyOptional({ enum: ['active', 'suspended', 'terminated', 'pending'] })
  @IsOptional()
  @IsEnum(['active', 'suspended', 'terminated', 'pending'])
  status?: string;
}
