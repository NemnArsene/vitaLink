import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class RejectClaimDto {
  @ApiProperty()
  @IsString()
  rejectionReason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
