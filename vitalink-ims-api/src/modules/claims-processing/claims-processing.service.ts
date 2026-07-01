import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InsuranceClaim, InsuranceClaimDocument } from './schemas/insurance-claim.schema';
import { GatewayClientService } from '../gateway-client/gateway-client.service';
import { ApproveClaimDto, RejectClaimDto, AnalyzeClaimDto, PayClaimDto } from './dto/claim-action.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination.helper';

@Injectable()
export class ClaimsProcessingService {
  private readonly logger = new Logger(ClaimsProcessingService.name);

  constructor(
    @InjectModel(InsuranceClaim.name) private claimModel: Model<InsuranceClaimDocument>,
    private readonly gatewayClient: GatewayClientService,
  ) {}

  async findAll(pagination: PaginationDto): Promise<PaginatedResult<InsuranceClaimDocument>> {
    return paginate(this.claimModel, { deletedAt: null }, pagination);
  }

  async findOne(id: string): Promise<InsuranceClaimDocument> {
    const claim = await this.claimModel.findById(id).exec();
    if (!claim) {
      throw new NotFoundException(`Claim with ID ${id} not found`);
    }
    return claim;
  }

  async create(dto: CreateClaimDto): Promise<InsuranceClaimDocument> {
    const claimNumber = `CLM-${Date.now()}`;
    const claim = new this.claimModel({
      ...dto,
      claimNumber,
      statut: 'recue',
    });
    return claim.save();
  }

  async approve(id: string, dto: ApproveClaimDto, userId?: string): Promise<InsuranceClaimDocument> {
    const claim = await this.findOne(id);

    if (claim.statut !== 'recue' && claim.statut !== 'en_revision') {
      throw new Error('Only received or under-review claims can be approved');
    }

    claim.statut = 'approuvee';
    claim.montantApprouve = dto.montantApprouve || claim.montantTotal;
    claim.reviewedAt = new Date();
    claim.reviewedBy = userId || 'unknown';
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

  async reject(id: string, dto: RejectClaimDto, userId?: string): Promise<InsuranceClaimDocument> {
    const claim = await this.findOne(id);

    if (claim.statut !== 'recue' && claim.statut !== 'en_revision') {
      throw new Error('Only received or under-review claims can be rejected');
    }

    claim.statut = 'rejetee';
    claim.rejectionReason = dto.rejectionReason;
    claim.reviewedAt = new Date();
    claim.reviewedBy = userId || 'unknown';
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

  async analyze(id: string, dto: AnalyzeClaimDto, userId?: string): Promise<InsuranceClaimDocument> {
    const claim = await this.findOne(id);

    if (claim.statut !== 'recue') {
      throw new Error('Only received claims can be sent for analysis');
    }

    claim.statut = 'en_revision';
    claim.reviewedAt = new Date();
    claim.reviewedBy = userId || 'unknown';
    if (dto.notes) {
      claim.notes = dto.notes;
    }

    return claim.save();
  }

  async pay(id: string, dto: PayClaimDto, userId?: string): Promise<InsuranceClaimDocument> {
    const claim = await this.findOne(id);

    if (claim.statut !== 'approuvee') {
      throw new Error('Only approved claims can be paid');
    }

    claim.statut = 'remboursee';
    claim.montantApprouve = dto.montantApprouve || claim.montantApprouve;
    claim.reviewedAt = new Date();
    claim.reviewedBy = userId || 'unknown';
    if (dto.notes) {
      claim.notes = dto.notes;
    }

    await claim.save();

    // Notify gateway
    try {
      await this.gatewayClient.notifyClaimDecision({
        claimId: (claim as any)._id.toString(),
        claimNumber: claim.claimNumber,
        decision: 'paid',
        montantApprouve: claim.montantApprouve,
        hospitalId: claim.hospitalId,
      });
    } catch (error) {
      this.logger.error(`Failed to notify gateway of payment: ${error.message}`);
    }

    return claim;
  }
}
