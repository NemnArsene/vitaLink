import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InsuranceClaim, InsuranceClaimDocument } from './schemas/insurance-claim.schema';
import { GatewayClientService } from '../gateway-client/gateway-client.service';
import { ApproveClaimDto, RejectClaimDto } from './dto/claim-action.dto';

@Injectable()
export class ClaimsProcessingService {
  private readonly logger = new Logger(ClaimsProcessingService.name);

  constructor(
    @InjectModel(InsuranceClaim.name) private claimModel: Model<InsuranceClaimDocument>,
    private readonly gatewayClient: GatewayClientService,
  ) {}

  async findAll(): Promise<InsuranceClaimDocument[]> {
    return this.claimModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<InsuranceClaimDocument> {
    const claim = await this.claimModel.findById(id).exec();
    if (!claim) {
      throw new NotFoundException(`Claim with ID ${id} not found`);
    }
    return claim;
  }

  async approve(id: string, dto: ApproveClaimDto): Promise<InsuranceClaimDocument> {
    const claim = await this.findOne(id);

    if (claim.statut !== 'recue' && claim.statut !== 'en_revision') {
      throw new Error('Only received or under-review claims can be approved');
    }

    claim.statut = 'approuvee';
    claim.montantApprouve = dto.montantApprouve || claim.montantTotal;
    claim.reviewedAt = new Date();
    if (dto.notes) {
      claim.notes = dto.notes;
    }

    await claim.save();

    // Notify gateway
    try {
      await this.gatewayClient.notifyClaimDecision({
        claimId: (claim as any)._id.toString(),
        claimNumber: claim.claimNumber,
        decision: 'approved',
        montantApprouve: claim.montantApprouve,
        hospitalId: claim.hospitalId,
      });
    } catch (error) {
      this.logger.error(`Failed to notify gateway of approval: ${error.message}`);
    }

    return claim;
  }

  async reject(id: string, dto: RejectClaimDto): Promise<InsuranceClaimDocument> {
    const claim = await this.findOne(id);

    if (claim.statut !== 'recue' && claim.statut !== 'en_revision') {
      throw new Error('Only received or under-review claims can be rejected');
    }

    claim.statut = 'rejetee';
    claim.rejectionReason = dto.rejectionReason;
    claim.reviewedAt = new Date();
    if (dto.notes) {
      claim.notes = dto.notes;
    }

    await claim.save();

    // Notify gateway
    try {
      await this.gatewayClient.notifyClaimDecision({
        claimId: (claim as any)._id.toString(),
        claimNumber: claim.claimNumber,
        decision: 'rejected',
        rejectionReason: dto.rejectionReason,
        hospitalId: claim.hospitalId,
      });
    } catch (error) {
      this.logger.error(`Failed to notify gateway of rejection: ${error.message}`);
    }

    return claim;
  }
}
