import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class EligibilityCheckDto {
  @ApiProperty()
  @IsString()
  hospitalId: string;

  @ApiProperty()
  @IsString()
  insuranceCardNumber: string;

  @ApiProperty()
  @IsString()
  patientId: string;

  @ApiProperty()
  @IsString()
  patientName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  service?: string;
}
