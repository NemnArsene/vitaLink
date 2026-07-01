import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { RefreshToken } from '../schemas/refresh-token.schema';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    configService: ConfigService,
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshToken>,
  ) {
    const options: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET', 'default-refresh-secret'),
      passReqToCallback: true,
    };
    super(options);
  }

  async validate(req: any, payload: any) {
    const refreshToken = req.get('Authorization')?.replace('Bearer ', '');

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const storedToken = await this.refreshTokenModel.findOne({
      userId: payload.sub,
      isActive: true,
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token is invalid or revoked');
    }

    // Verify the actual token matches the stored hash
    const isValid = await bcrypt.compare(refreshToken, storedToken.tokenHash);
    if (!isValid) {
      throw new UnauthorizedException('Refresh token hash mismatch');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      scope: payload.scope,
      entityId: payload.entityId,
      entityType: payload.entityType,
      tokenId: storedToken._id.toString(),
    };
  }
}
