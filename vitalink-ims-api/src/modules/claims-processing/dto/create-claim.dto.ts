import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
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

  @ApiProperty({ required: false })
  dateActe?: Date;
}

export class CreateClaimDto {
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
}
