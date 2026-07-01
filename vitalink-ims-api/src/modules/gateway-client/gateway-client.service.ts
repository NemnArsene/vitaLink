import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';

export interface ClaimDecision {
  claimId: string;
  claimNumber: string;
  decision: 'approved' | 'rejected' | 'paid';
  montantApprouve?: number;
  rejectionReason?: string;
  hospitalId: string;
}

@Injectable()
export class GatewayClientService {
  private readonly logger = new Logger(GatewayClientService.name);
  private readonly gatewayUrl: string;
  private readonly jwtSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.gatewayUrl = this.configService.get('app.gateway.url', 'http://localhost:3000');
    this.jwtSecret = this.configService.get('app.gateway.jwtSecret', 'shared-jwt-secret');
  }

  private generateServiceToken(): string {
    return jwt.sign(
      {
        sub: 'ims-service',
        email: 'ims@vitalink.com',
        role: 'service',
        scope: 'scope:insurance',
        entityId: 'ims-001',
        entityType: 'insurance',
        permissions: ['claims:write', 'claims:read'],
      },
      this.jwtSecret,
      { expiresIn: '1h' },
    );
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.generateServiceToken()}`,
      'Content-Type': 'application/json',
      'X-Service-Source': 'vitalink-ims-api',
    };
  }

  async notifyClaimDecision(decision: ClaimDecision): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.gatewayUrl}/api/v1/claims/${decision.claimId}/decision`,
          decision,
          { headers: this.getHeaders() },
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to notify claim decision: ${error.message}`);
      throw error;
    }
  }
}
