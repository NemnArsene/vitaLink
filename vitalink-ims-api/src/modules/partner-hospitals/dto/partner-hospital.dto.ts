import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsNumber, IsArray, IsDateString, IsEnum } from 'class-validator';

export class CreatePartnerHospitalDto {
  @ApiProperty()
  @IsString()
  hospitalCode: string;

  @ApiProperty()
  @IsString()
  hospitalName: string;

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
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  directorName?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  servicesDisponibles?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  niveau?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  capaciteLits?: number;
}

export class UpdatePartnerHospitalDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hospitalName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

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
  directorName?: string;

  @ApiPropertyOptional({ enum: ['actif', 'inactif', 'suspendu'] })
  @IsOptional()
  @IsEnum(['actif', 'inactif', 'suspendu'])
  statut?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  servicesDisponibles?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  capaciteLits?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
