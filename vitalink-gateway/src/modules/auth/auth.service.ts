import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, UserInfoDto } from './dto/auth-response.dto';
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
  ) {}

  /**
   * Stateless login: verify credentials, return JWT access token.
   * No refresh tokens, no DB storage. Token expires after JWT_ACCESS_EXPIRATION.
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

    const accessToken = this.generateAccessToken(user, scope, jti);

    this.logger.log(`User ${user.email} logged in via ${platform}`);

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
      refreshToken: '', // MVP: no refresh tokens
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
      tokenType: 'Bearer',
      user: userInfo,
    };
  }

  /**
   * Stateless logout — for MVP, client simply discards the token.
   * In production, add Redis-backed token blacklist.
   */
  async logout(userId: string): Promise<void> {
    this.logger.log(`User ${userId} logged out`);
  }

  private generateAccessToken(user: any, scope: Scope, jti: string): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      scope,
      entityId: user.entityId,
      entityType: user.entityId,
      permissions: user.permissions,
      jti,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET', 'default-secret'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
    });
  }
}
