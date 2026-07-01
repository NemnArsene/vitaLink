import { Injectable, Logger } from '@nestjs/common';
import { GatewayClientService } from '../gateway-client/gateway-client.service';
import { CheckEligibilityDto } from './dto/eligibility.dto';

export interface EligibilityResult {
  eligible: boolean;
  patientId: string;
  insuranceCardNumber: string;
  coverageDetails: {
    active: boolean;
    provider: string;
    policyNumber: string;
    expiryDate: string;
    coveragePercentage: number;
  };
  checkedAt: string;
}

@Injectable()
export class EligibilityService {
  private readonly logger = new Logger(EligibilityService.name);

  constructor(
    private readonly gatewayClient: GatewayClientService,
  ) {}

  async checkEligibility(dto: CheckEligibilityDto): Promise<EligibilityResult> {
    this.logger.log(`Checking eligibility for patient ${dto.patientId}`);

    try {
      const result = await this.gatewayClient.checkEligibility({
        patientId: dto.patientId,
        insuranceCardNumber: dto.insuranceCardNumber,
        serviceDate: dto.serviceDate,
        actCode: dto.actCode,
      });

      return {
        eligible: result.eligible,
        patientId: dto.patientId,
        insuranceCardNumber: dto.insuranceCardNumber || 'N/A',
        coverageDetails: result.coverageDetails,
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Eligibility check failed: ${error.message}`);
      throw error;
    }
  }
}
