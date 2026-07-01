import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Policy, PolicyDocument } from '../policies/schemas/policy.schema';

export interface EligibilityRequest {
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
export class EligibilityProviderService {
  private readonly logger = new Logger(EligibilityProviderService.name);

  constructor(
    @InjectModel(Policy.name) private policyModel: Model<PolicyDocument>,
  ) {}

  async checkEligibility(request: EligibilityRequest): Promise<EligibilityResponse> {
    this.logger.log(`Checking eligibility for patient ${request.patientId}`);

    // Find active policy by card number or patient
    let policy: PolicyDocument | null = null;

    if (request.insuranceCardNumber) {
      policy = await this.policyModel.findOne({
        insuranceCardNumber: request.insuranceCardNumber,
        statut: 'active',
      }).exec();
    }

    if (!policy) {
      return {
        eligible: false,
        coverageDetails: {
          active: false,
          provider: 'N/A',
          policyNumber: 'N/A',
          expiryDate: 'N/A',
          coveragePercentage: 0,
        },
      };
    }

    // Check if policy is not expired
    if (policy.dateFin && new Date(policy.dateFin) < new Date()) {
      return {
        eligible: false,
        coverageDetails: {
          active: false,
          provider: policy.providerName,
          policyNumber: policy.policyNumber,
          expiryDate: policy.dateFin.toISOString(),
          coveragePercentage: 0,
        },
      };
    }

    // Check specific act coverage if provided
    let coveragePercentage = 100;
    if (request.actCode && policy.garanties) {
      const garantie = policy.garanties.find((g) => g.code === request.actCode);
      if (garantie) {
        coveragePercentage = garantie.pourcentage;
      } else {
        // Act not covered
        coveragePercentage = 0;
      }
    }

    return {
      eligible: true,
      coverageDetails: {
        active: true,
        provider: policy.providerName,
        policyNumber: policy.policyNumber,
        expiryDate: policy.dateFin ? policy.dateFin.toISOString() : 'N/A',
        coveragePercentage,
      },
    };
  }
}
