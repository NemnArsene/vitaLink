import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';

export class ClaimDecisionDto {
  @ApiProperty({ enum: ['approved', 'rejected'] })
  @IsEnum(['approved', 'rejected'])
  decision: string;

  @ApiProperty()
  @IsString()
  claimNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  montantApprouve?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiProperty()
  @IsString()
  hospitalId: string;
}
