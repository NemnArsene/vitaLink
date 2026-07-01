import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtPayload } from '../decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('app.gateway.jwtSecret', 'shared-jwt-secret');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any): Promise<JwtPayload> {
    return {
      sub: payload.originalSub || payload.sub,
      email: payload.originalEmail || payload.email,
      role: payload.originalRole || payload.role,
      scope: payload.scope,
      entityId: payload.entityId,
      entityType: payload.entityType,
      permissions: payload.permissions || [],
    };
  }
}
