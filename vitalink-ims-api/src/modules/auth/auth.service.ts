import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

interface ImsUser {
  id: string;
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: string;
  superiorId: string | null;
}

const IMS_USERS: ImsUser[] = [
  {
    id: 'ims_dir_001',
    email: 'directeur@ims.com',
    password: 'Directeur@123',
    nom: 'Diallo',
    prenom: 'Mamadou',
    role: 'DIRECTEUR',
    superiorId: null,
  },
  {
    id: 'ims_liq_001',
    email: 'liquidateur@ims.com',
    password: 'Liquidateur@123',
    nom: 'Ndiaye',
    prenom: 'Aminata',
    role: 'LIQUIDATEUR',
    superiorId: 'ims_mgr_001',
  },
  {
    id: 'ims_ana_001',
    email: 'analyste@ims.com',
    password: 'Analyste@123',
    nom: 'Sy',
    prenom: 'Ousmane',
    role: 'ANALYSTE',
    superiorId: 'ims_mgr_001',
  },
  {
    id: 'ims_mgr_001',
    email: 'manager@ims.com',
    password: 'Manager@123',
    nom: 'Ba',
    prenom: 'Fatou',
    role: 'MANAGER',
    superiorId: 'ims_dir_001',
  },
];

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = IMS_USERS.find((u) => u.email === email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (password !== user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user);
    this.logger.log(`User ${user.email} logged in`);

    return {
      accessToken,
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '3600s'),
      tokenType: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nom: user.nom,
        prenom: user.prenom,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    this.logger.log(`User ${userId} logged out`);
  }

  findAll(): ImsUser[] {
    return IMS_USERS;
  }

  findById(id: string): ImsUser | undefined {
    return IMS_USERS.find((u) => u.id === id);
  }

  findSuperior(userId: string): ImsUser | undefined {
    const user = this.findById(userId);
    if (!user || !user.superiorId) return undefined;
    return this.findById(user.superiorId);
  }

  private generateAccessToken(user: ImsUser): string {
    const secret = this.configService.get<string>('app.gateway.jwtSecret', 'shared-jwt-secret');
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      app: 'IMS',
    };
    return this.jwtService.sign(payload, { secret, expiresIn: '3600s' });
  }
}
