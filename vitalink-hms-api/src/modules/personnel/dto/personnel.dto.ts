import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsDateString, IsEnum, IsArray, IsInt, Min, Max } from 'class-validator';

export class CreatePersonnelDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  employeeId: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsString()
  role: string;

  @ApiProperty()
  @IsString()
  service: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateEmbauche?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateNaissance?: string;

  @ApiPropertyOptional({ enum: ['M', 'F'] })
  @IsOptional()
  @IsEnum(['M', 'F'])
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diplome?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  certifications?: string[];

  @ApiPropertyOptional({ description: 'ID du supérieur hiérarchique' })
  @IsOptional()
  @IsString()
  reportsTo?: string;
}

export class UpdatePersonnelDto {
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
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  service?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiPropertyOptional({ enum: ['actif', 'inactif', 'conge', 'suspendu'] })
  @IsOptional()
  @IsEnum(['actif', 'inactif', 'conge', 'suspendu'])
  statut?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diplome?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  certifications?: string[];

  @ApiPropertyOptional({ description: 'Limite journalière de patients', default: 25 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  dailyPatientLimit?: number;

  @ApiPropertyOptional({ description: 'ID du supérieur hiérarchique' })
  @IsOptional()
  @IsString()
  reportsTo?: string;
}
