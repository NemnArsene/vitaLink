import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';

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
