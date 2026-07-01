import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

/**
 * AuthController — Stateless JWT authentication
 * Login returns a short-lived JWT. No refresh tokens for MVP.
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user and return JWT access token',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<ApiResponseDto<AuthResponseDto>> {
    const result = await this.authService.login(loginDto);
    return ApiResponseDto.ok(result, 'Login successful');
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Exchange a valid refresh token for a new access + refresh token pair (rotation)',
  })
  @ApiResponse({ status: 200, description: 'Tokens refreshed', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<ApiResponseDto<AuthResponseDto>> {
    const result = await this.authService.refresh(refreshTokenDto);
    return ApiResponseDto.ok(result, 'Tokens refreshed');
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'User logout',
    description: 'Revoke refresh tokens and blacklist current JWT',
  })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@CurrentUser() user: JwtPayload): Promise<ApiResponseDto<null>> {
    await this.authService.logout(user.sub, user.jti);
    return ApiResponseDto.ok(null, 'Logout successful');
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the authenticated user information from JWT token',
  })
  @ApiResponse({ status: 200, description: 'User profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getCurrentUser(@CurrentUser() user: JwtPayload): ApiResponseDto<JwtPayload> {
    return ApiResponseDto.ok(user, 'User profile retrieved');
  }
}
