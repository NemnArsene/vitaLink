import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';

export class ClaimDecisionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  claimId?: string;

  @ApiProperty({ enum: ['approved', 'rejected', 'paid', 'disputed'] })
  @IsEnum(['approved', 'rejected', 'paid', 'disputed'])
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
