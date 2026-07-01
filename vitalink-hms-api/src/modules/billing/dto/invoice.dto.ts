import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsDateString, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

class ActeDto {
  @ApiProperty()
  @IsString()
  acte: string;

  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  montant: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateActe?: string;
}

export class CreateInvoiceDto {
  @ApiProperty()
  @IsMongoId()
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInvoiceDto {
  @ApiPropertyOptional({ type: [ActeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActeDto)
  actes?: ActeDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
