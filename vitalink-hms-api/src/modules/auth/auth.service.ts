import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, UserInfoDto } from './dto/auth-response.dto';

const MOCK_USERS = [
  { id: 'usr_h_001', email: 'admin@hgd.cm', password: 'password', nom: 'Admin', prenom: 'Système', role: 'ADMIN_HOPITAL', service: 'Administration', entityId: '11111111-1111-1111-1111-111111111111', permissions: ['*'] },
  { id: 'usr_h_002', email: 'medecin@hgd.cm', password: 'password', nom: 'Diallo', prenom: 'Amadou', role: 'MEDECIN', service: 'Cardiologie', entityId: '11111111-1111-1111-1111-111111111111', permissions: ['consultations.create', 'consultations.view', 'actes.create', 'prescriptions.create', 'patients.view'] },
  { id: 'usr_h_003', email: 'reception@hgd.cm', password: 'password', nom: 'Diop', prenom: 'Moussa', role: 'RECEPTIONIST', service: 'Accueil', entityId: '11111111-1111-1111-1111-111111111111', permissions: ['patients.create', 'patients.view', 'admissions.create'] },
  { id: 'usr_h_004', email: 'triage@hgd.cm', password: 'password', nom: 'Gueye', prenom: 'Aminata', role: 'TRIAGE', service: 'Urgences', entityId: '11111111-1111-1111-1111-111111111111', permissions: ['triage.create', 'triage.view'] },
  { id: 'usr_h_005', email: 'laboratoire@hgd.cm', password: 'password', nom: 'Ndiaye', prenom: 'Ibrahima', role: 'LABORATORY', service: 'Laboratoire', entityId: '11111111-1111-1111-1111-111111111111', permissions: ['analyses.create', 'analyses.view', 'resultats.create'] },
  { id: 'usr_h_006', email: 'caissier@hgd.cm', password: 'password', nom: 'Fall', prenom: 'Khady', role: 'CASHIER', service: 'Caisse', entityId: '11111111-1111-1111-1111-111111111111', permissions: ['paiements.create', 'paiements.view'] },
  { id: 'usr_h_007', email: 'infirmier@hgd.cm', password: 'password', nom: 'Ndiaye', prenom: 'Fatou', role: 'NURSE', service: 'Pédiatrie', entityId: '11111111-1111-1111-1111-111111111111', permissions: ['soins.create', 'soins.view', 'patients.view'] },
  { id: 'usr_h_008', email: 'facturation@hgd.cm', password: 'password', nom: 'Ba', prenom: 'Ousmane', role: 'BILLING', service: 'Facturation', entityId: '11111111-1111-1111-1111-111111111111', permissions: ['factures.create', 'factures.view', 'remboursements.view'] },
  { id: 'usr_h_009', email: 'direction@hgd.cm', password: 'password', nom: 'Fall', prenom: 'Cheikh', role: 'DIRECTOR', service: 'Direction', entityId: '11111111-1111-1111-1111-111111111111', permissions: ['*'] },
];

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = MOCK_USERS.find((u) => u.email === loginDto.email);
    if (!user || loginDto.password !== user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const scope = 'scope:hospital';
    const jti = uuidv4();
    const secret = this.configService.get<string>('app.gateway.jwtSecret', 'shared-jwt-secret');
    const expiresIn = this.configService.get<string>('app.jwt.expiresIn', '3600s');

    const payload = { sub: user.id, email: user.email, nom: user.nom, prenom: user.prenom, role: user.role, service: user.service, scope, entityId: user.entityId, entityType: 'hospital', permissions: user.permissions, jti };

    const accessToken = this.jwtService.sign(payload as any, { secret, expiresIn: expiresIn as any });

    this.logger.log(`User ${user.email} logged in`);

    const userInfo: UserInfoDto = {
      id: user.id, email: user.email, nom: user.nom, prenom: user.prenom, role: user.role, service: user.service, scope, entityId: user.entityId, entityType: 'hospital', permissions: user.permissions,
    };

    return { accessToken, refreshToken: '', expiresIn, tokenType: 'Bearer', user: userInfo };
  }

  async logout(userId: string): Promise<void> {
    this.logger.log(`User ${userId} logged out`);
  }
}
