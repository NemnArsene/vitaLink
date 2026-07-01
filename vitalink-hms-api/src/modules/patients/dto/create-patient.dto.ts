import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsDateString, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @ApiProperty()
  @IsString()
  street: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  zipCode: string;
}

class EmergencyContactDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  relationship: string;
}

export class CreatePatientDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  medicalRecordNumber: string;

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
}
