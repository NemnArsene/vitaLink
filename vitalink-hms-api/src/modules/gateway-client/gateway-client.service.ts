import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';

export interface ClaimSubmission {
  invoiceId: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  hospitalId: string;
  actes: Array<{
    acte: string;
    code: string;
    description: string;
    montant: number;
    dateActe?: Date;
  }>;
  montantTotal: number;
  insuranceCardNumber?: string;
}

export interface ClaimResponse {
  claimId: string;
  status: string;
  message: string;
}

export interface EligibilityCheck {
  patientId: string;
  insuranceCardNumber?: string;
  serviceDate?: string;
  actCode?: string;
}

export interface EligibilityResponse {
  eligible: boolean;
  coverageDetails: {
    active: boolean;
    provider: string;
    policyNumber: string;
    expiryDate: string;
    coveragePercentage: number;
  };
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
        sub: 'hms-service',
        email: 'hms@vitalink.com',
        role: 'service',
        scope: 'scope:hospital',
        entityId: 'hms-001',
        entityType: 'hospital',
        permissions: ['claims:write', 'eligibility:read'],
      },
      this.jwtSecret,
      { expiresIn: '1h' },
    );
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.generateServiceToken()}`,
      'Content-Type': 'application/json',
      'X-Service-Source': 'vitalink-hms-api',
    };
  }

  async submitClaim(claim: ClaimSubmission): Promise<ClaimResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.gatewayUrl}/api/v1/claims`,
          claim,
          { headers: this.getHeaders() },
        ),
      );
      const body = response.data;
      const payload = body?.data ?? body;
      return {
        claimId: payload?._id ?? payload?.claimId ?? payload?.id ?? '',
        status: payload?.statut ?? payload?.status ?? 'unknown',
        message: body?.message ?? 'Claim submitted',
      };
    } catch (error) {
      this.logger.error(`Failed to submit claim: ${error.message}`);
      throw error;
    }
  }

  async checkEligibility(check: EligibilityCheck): Promise<EligibilityResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.gatewayUrl}/api/v1/eligibility/check`,
          check,
          { headers: this.getHeaders() },
        ),
      );
      // Handle IMS TransformInterceptor envelope: { success, data: { eligible, coverageDetails } }
      const raw = response.data;
      const payload: EligibilityResponse = raw?.data ?? raw;
      return payload;
    } catch (error) {
      this.logger.error(`Failed to check eligibility: ${error.message}`);
      throw error;
    }
  }

  async emitNotification(event: { type: string; data: any; userId?: string; entityType?: string }): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.gatewayUrl}/api/v1/notifications/emit`,
          event,
          { headers: this.getHeaders() },
        ),
      );
    } catch (error) {
      this.logger.error(`Failed to emit notification: ${error.message}`);
    }
  }
}
