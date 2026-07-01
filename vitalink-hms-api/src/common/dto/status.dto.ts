import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class StatusDto {
  @ApiProperty({ description: 'Nouveau statut' })
  @IsString()
  @IsNotEmpty()
  statut: string;
}
