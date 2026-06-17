import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@hgd.cm',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password',
    description: 'User password',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    enum: ['hospital', 'insurance'],
    description: 'Platform type for routing',
  })
  @IsString()
  @IsNotEmpty()
  platform: 'hospital' | 'insurance';
}
