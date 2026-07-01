import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'directeur@ims.com', description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Directeur@123', description: 'User password' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}
