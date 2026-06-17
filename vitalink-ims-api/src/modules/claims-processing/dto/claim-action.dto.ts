import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ApproveClaimDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  montantApprouve?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectClaimDto {
  @ApiProperty()
  @IsString()
  rejectionReason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
