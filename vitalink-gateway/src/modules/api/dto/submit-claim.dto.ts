import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, ValidateNested, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class ActeDto {
  @ApiProperty()
  @IsString()
  acte: string;

  @ApiProperty()
  @IsString()
  code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNumber()
  montant: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateActe?: string;
}

export class SubmitClaimDto {
  @ApiProperty()
  @IsString()
  invoiceId: string;

  @ApiProperty()
  @IsString()
  invoiceNumber: string;

  @ApiProperty()
  @IsString()
  patientId: string;

  @ApiProperty()
  @IsString()
  patientName: string;

  @ApiProperty()
  @IsString()
  hospitalId: string;

  @ApiProperty({ type: [ActeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActeDto)
  actes: ActeDto[];

  @ApiProperty()
  @IsNumber()
  montantTotal: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insuranceCardNumber?: string;
}
