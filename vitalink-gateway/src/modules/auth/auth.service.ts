import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto, UserInfoDto } from './dto/auth-response.dto';
import { RefreshToken } from './schemas/refresh-token.schema';
import { TokenBlacklist } from './schemas/token-blacklist.schema';
import { Scope, getScopeForRole, PlatformRole } from '../../common/enums/roles.enum';

/**
 * Mock users for development — in production, these come from HMS/IMS APIs via HTTP.
 */
const MOCK_USERS = {
  hospital: [
    {
      id: 'usr_h_001',
      email: 'admin@hgd.cm',
      password: 'password',
      nom: 'Admin',
      prenom: 'Système',
      role: PlatformRole.ADMIN_HOPITAL,
      entityId: '11111111-1111-1111-1111-111111111111',
      permissions: ['users.manage', 'services.manage', 'audit.view', 'stats.view', 'patients.create'],
    },
    {
      id: 'usr_h_002',
      email: 'medecin@hgd.cm',
      password: 'password',
      nom: 'Diallo',
      prenom: 'Amadou',
      role: PlatformRole.MEDECIN,
      entityId: '11111111-1111-1111-1111-111111111111',
      permissions: ['consultations.create', 'consultations.view', 'actes.create', 'prescriptions.create', 'patients.view'],
    },
  ],
  insurance: [
    {
      id: 'usr_a_001',
      email: 'admin@assurancesanteplus.cm',
      password: 'password',
      nom: 'Admin',
      prenom: 'Assurance',
      role: PlatformRole.DIRECTEUR_ASSURANCE,
      entityId: '22222222-2222-2222-2222-222222222222',
      permissions: ['hopitaux.manage', 'demandes.view', 'demandes.approuver', 'kpi.view'],
    },
    {
      id: 'usr_a_002',
      email: 'agent@assurancesanteplus.cm',
      password: 'password',
      nom: 'Ndiaye',
      prenom: 'Fatou',
      role: PlatformRole.AGENT_ASSURANCE,
      entityId: '22222222-2222-2222-2222-222222222222',
      permissions: ['assures.view', 'polices.create', 'demandes.view', 'demandes.approuver', 'demandes.rejeter'],
    },
  ],
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshToken>,
    @InjectModel(TokenBlacklist.name) private tokenBlacklistModel: Model<TokenBlacklist>,
  ) {}

  /**
   * Login: verify credentials, return JWT access + refresh tokens.
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password, platform } = loginDto;

    const users = MOCK_USERS[platform] || [];
    const user = users.find((u) => u.email === email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (password !== user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const scope = getScopeForRole(user.role);
    const jti = uuidv4();

    const accessToken = this.generateAccessToken(user, scope, jti, platform);

    this.logger.log(`User ${user.email} logged in via ${platform}`);

    const refreshTokenValue = this.generateRefreshTokenJwt(user.id);
    await this.storeRefreshToken(user.id, refreshTokenValue);

    const userInfo: UserInfoDto = {
      id: user.id,
      email: user.email,
      role: user.role,
      scope,
      entityId: user.entityId,
      entityType: platform,
      permissions: user.permissions,
    };

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
      tokenType: 'Bearer',
      user: userInfo,
    };
  }

  /**
   * Refresh token: validate refresh JWT, issue new access + refresh tokens (rotation).
   */
  async refresh(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    const { refreshToken } = dto;

    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'default-refresh-secret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const storedToken = await this.refreshTokenModel.findOne({
      userId: payload.sub,
      isActive: true,
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token not found or revoked');
    }

    const isValid = await bcrypt.compare(refreshToken, storedToken.tokenHash);
    if (!isValid) {
      await storedToken.updateOne({ $set: { isActive: false, revokedAt: new Date() } }).exec();
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // Revoke old token (rotation)
    storedToken.isActive = false;
    storedToken.revokedAt = new Date();
    await storedToken.save();

    // Generate new tokens
    const user = this.findMockUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const scope = getScopeForRole(user.role);
    const jti = uuidv4();
    const newAccessToken = this.generateAccessToken(user, scope, jti, payload.entityType || payload.platform);

    const newRefreshTokenValue = this.generateRefreshTokenJwt(user.id);
    await this.storeRefreshToken(user.id, newRefreshTokenValue, storedToken._id.toString());

    const userInfo: UserInfoDto = {
      id: user.id,
      email: user.email,
      role: user.role,
      scope,
      entityId: user.entityId,
      entityType: payload.entityType || payload.platform,
      permissions: user.permissions,
    };

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenValue,
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
      tokenType: 'Bearer',
      user: userInfo,
    };
  }

  /**
   * Logout: revoke all active refresh tokens for user, blacklist current JWT.
   */
  async logout(userId: string, jti?: string): Promise<void> {
    await this.refreshTokenModel.updateMany(
      { userId, isActive: true },
      { $set: { isActive: false, revokedAt: new Date() } },
    ).exec();

    if (jti) {
      await this.tokenBlacklistModel.create({ jti, userId, revokedAt: new Date(), reason: 'logout' });
    }

    this.logger.log(`User ${userId} logged out`);
  }

  private findMockUser(userId: string): any | undefined {
    for (const platform of Object.values(MOCK_USERS)) {
      const user = platform.find((u: any) => u.id === userId);
      if (user) return user;
    }
    return undefined;
  }

  private async storeRefreshToken(userId: string, token: string, replacedByTokenId?: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const tokenHash = await bcrypt.hash(token, 10);
    await this.refreshTokenModel.create({
      userId,
      tokenHash,
      expiresAt,
      replacedByTokenId,
    });
  }

  private generateRefreshTokenJwt(userId: string): string {
    const payload = {
      sub: userId,
      type: 'refresh',
      jti: uuidv4(),
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'default-refresh-secret'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
    });
  }

  private generateAccessToken(user: any, scope: Scope, jti: string, platform: string): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      scope,
      entityId: user.entityId,
      entityType: platform,
      permissions: user.permissions,
      jti,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET', 'default-secret'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
    });
  }
}
