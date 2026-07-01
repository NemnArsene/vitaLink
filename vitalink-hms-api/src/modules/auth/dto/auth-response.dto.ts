import { ApiProperty } from '@nestjs/swagger';

export class UserInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  nom: string;

  @ApiProperty()
  prenom: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  service: string;

  @ApiProperty()
  scope: string;

  @ApiProperty()
  entityId: string;

  @ApiProperty({ enum: ['hospital', 'insurance'] })
  entityType: string;

  @ApiProperty()
  permissions: string[];
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token' })
  refreshToken: string;

  @ApiProperty({ example: '3600s' })
  expiresIn: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  @ApiProperty()
  user: UserInfoDto;
}
