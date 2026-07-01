import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class AddSoinDto {
  @ApiProperty({ enum: ['médicament', 'procédure', 'analyse'] })
  @IsEnum(['médicament', 'procédure', 'analyse'])
  type: string;

  @ApiProperty({ example: 'Amoxicilline 500mg' })
  @IsString()
  nom: string;

  @ApiPropertyOptional({ example: '1 comprimé 3x/jour' })
  @IsOptional()
  @IsString()
  posologie?: string;

  @ApiProperty()
  @IsDateString()
  réaliséLe: string;
}
