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

export class AnalyzeClaimDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class PayClaimDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  montantApprouve?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class DisputeClaimDto {
  @ApiProperty()
  @IsString()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class ResolveDisputeDto {
  @ApiProperty({ enum: ['approuvee', 'rejetee'] })
  @IsEnum(['approuvee', 'rejetee'])
  resolution: 'approuvee' | 'rejetee';

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  montantApprouve?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
