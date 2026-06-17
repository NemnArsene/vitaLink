import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsDateString, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zipCode?: string;
}

class EmergencyContactDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relationship?: string;
}

export class UpdatePatientDto {
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

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional({ type: EmergencyContactDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bloodType?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  allergies?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  antecedents?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insuranceCardNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insuranceProvider?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'deceased'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'deceased'])
  status?: string;
}
