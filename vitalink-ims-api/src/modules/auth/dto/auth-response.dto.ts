import { ApiProperty } from '@nestjs/swagger';

class UserInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  nom: string;

  @ApiProperty()
  prenom: string;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ example: '3600s' })
  expiresIn: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  @ApiProperty()
  user: UserInfoDto;
}
