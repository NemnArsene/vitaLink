import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InsuranceClaim, InsuranceClaimDocument } from './schemas/insurance-claim.schema';
import { Invoice, InvoiceDocument } from '../invoices/schemas/invoice.schema';
import { Insured, InsuredDocument } from '../insureds/schemas/insured.schema';
import { GatewayClientService } from '../gateway-client/gateway-client.service';
import { ApproveClaimDto, RejectClaimDto, AnalyzeClaimDto, PayClaimDto, DisputeClaimDto, ResolveDisputeDto } from './dto/claim-action.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { paginate } from '../../common/utils/pagination.helper';

@Injectable()
export class ClaimsProcessingService {
  private readonly logger = new Logger(ClaimsProcessingService.name);
  private readonly decisionEventByStatus: Record<string, 'approved' | 'rejected' | 'paid' | 'disputed'> = {
    approuvee: 'approved',
    rejetee: 'rejected',
    remboursee: 'paid',
    litige: 'disputed',
  };

  constructor(
    @InjectModel(InsuranceClaim.name) private claimModel: Model<InsuranceClaimDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Insured.name) private insuredModel: Model<InsuredDocument>,
    private readonly gatewayClient: GatewayClientService,
  ) {}

  async findAll(status?: string, pagination?: PaginationDto): Promise<PaginatedResult<InsuranceClaimDocument>> {
    const filter: any = { deletedAt: null };
    if (status) {
      filter.statut = status;
    }
    return paginate(this.claimModel, filter, pagination || new PaginationDto());
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
    const saved = await claim.save();

    await this.syncInvoiceFromClaim(saved, 'recue');

    // Auto-verification : vérifier la facture et le statut de l'assuré
    if (dto.insuranceCardNumber) {
      try {
        const verificationResult = await this.verifyClaim(dto, saved);
        saved.statut = verificationResult.valid ? 'en_attente' : 'rejetee';
        if (!verificationResult.valid) {
          saved.rejectionReason = verificationResult.reason;
        }
        await saved.save();
        await this.syncInvoiceFromClaim(saved, saved.statut);
        if (saved.statut === 'rejetee') {
          await this.notifyClaimDecision(saved, 'rejected');
        }
        this.logger.log(`Claim ${claimNumber} auto-verified: ${saved.statut}`);
      } catch (error) {
        this.logger.error(`Auto-verification failed for claim ${claimNumber}: ${error.message}`);
      }
    }

    return saved;
  }

  private async verifyClaim(dto: CreateClaimDto, saved: InsuranceClaimDocument): Promise<{ valid: boolean; reason?: string }> {
    // 1. Vérifier que la facture a des actes et un montant valide
    if (!dto.actes || dto.actes.length === 0) {
      return { valid: false, reason: 'Facture sans actes médicaux' };
    }
    if (!dto.montantTotal || dto.montantTotal <= 0) {
      return { valid: false, reason: 'Montant de la facture invalide' };
    }

    // 2. Vérifier le statut de l'assuré via sa carte d'assurance
    const insured = await this.insuredModel.findOne({
      insuranceCardNumber: dto.insuranceCardNumber,
      deletedAt: null,
    }).exec();

    if (!insured) {
      return { valid: false, reason: 'Assuré non trouvé avec ce numéro de carte' };
    }

    if (insured.statut !== 'actif') {
      return { valid: false, reason: `Assuré non actif : statut "${insured.statut}"` };
    }

    const now = new Date();
    if (insured.dateFinCouverture && new Date(insured.dateFinCouverture) < now) {
      return { valid: false, reason: `Couverture expirée depuis le ${insured.dateFinCouverture.toISOString().split('T')[0]}` };
    }

    return { valid: true };
  }

  async approve(id: string, dto: ApproveClaimDto, userId?: string): Promise<InsuranceClaimDocument> {
    const claim = await this.findOne(id);

    if (claim.statut !== 'recue' && claim.statut !== 'en_attente' && claim.statut !== 'en_revision') {
      throw new BadRequestException('Only received, pending, or under-review claims can be approved');
    }

    claim.statut = 'approuvee';
    claim.montantApprouve = dto.montantApprouve || claim.montantTotal;
    claim.reviewedAt = new Date();
    claim.reviewedBy = userId || 'unknown';
    if (dto.notes) {
      claim.notes = dto.notes;
    }

    await claim.save();
    await this.syncInvoiceFromClaim(claim, 'approuvee');

    await this.notifyClaimDecision(claim, 'approved');

    return claim;
  }

  async reject(id: string, dto: RejectClaimDto, userId?: string): Promise<InsuranceClaimDocument> {
    const claim = await this.findOne(id);

    if (claim.statut !== 'recue' && claim.statut !== 'en_attente' && claim.statut !== 'en_revision') {
      throw new BadRequestException('Only received, pending, or under-review claims can be rejected');
    }

    claim.statut = 'rejetee';
    claim.rejectionReason = dto.rejectionReason;
    claim.reviewedAt = new Date();
    claim.reviewedBy = userId || 'unknown';
    if (dto.notes) {
      claim.notes = dto.notes;
    }

    await claim.save();
    await this.syncInvoiceFromClaim(claim, 'rejetee');

    await this.notifyClaimDecision(claim, 'rejected');

    return claim;
  }

  async analyze(id: string, dto: AnalyzeClaimDto, userId?: string): Promise<InsuranceClaimDocument> {
    const claim = await this.findOne(id);

    if (claim.statut !== 'recue' && claim.statut !== 'en_attente') {
      throw new BadRequestException('Only received or pending claims can be sent for analysis');
    }

    claim.statut = 'en_revision';
    claim.reviewedAt = new Date();
    claim.reviewedBy = userId || 'unknown';
    if (dto.notes) {
      claim.notes = dto.notes;
    }

    await claim.save();
    await this.syncInvoiceFromClaim(claim, 'en_revision');
    return claim;
  }

  async pay(id: string, dto: PayClaimDto, userId?: string): Promise<InsuranceClaimDocument> {
    const claim = await this.findOne(id);

    if (claim.statut !== 'approuvee') {
      throw new BadRequestException('Only approved claims can be paid');
    }

    claim.statut = 'remboursee';
    claim.montantApprouve = dto.montantApprouve || claim.montantApprouve;
    claim.reviewedAt = new Date();
    claim.reviewedBy = userId || 'unknown';
    if (dto.notes) {
      claim.notes = dto.notes;
    }

    await claim.save();
    await this.syncInvoiceFromClaim(claim, 'remboursee');

    await this.notifyClaimDecision(claim, 'paid');

    return claim;
  }

  async dispute(id: string, dto: DisputeClaimDto, userId?: string): Promise<InsuranceClaimDocument> {
    const claim = await this.findOne(id);

    if (claim.statut !== 'rejetee' && claim.statut !== 'approuvee') {
      throw new BadRequestException('Only rejected or approved claims can be disputed');
    }

    claim.statut = 'litige';
    claim.disputeReason = dto.reason;
    claim.reviewedAt = new Date();
    claim.reviewedBy = userId || 'unknown';
    if (dto.description) {
      claim.notes = dto.description;
    }

    await claim.save();
    await this.syncInvoiceFromClaim(claim, 'litige');

    await this.notifyClaimDecision(claim, 'disputed');

    return claim;
  }

  async resolveDispute(id: string, dto: ResolveDisputeDto, userId?: string): Promise<InsuranceClaimDocument> {
    const claim = await this.findOne(id);

    if (claim.statut !== 'litige') {
      throw new BadRequestException('Only disputed claims can be resolved');
    }

    claim.statut = dto.resolution;
    if (dto.resolution === 'approuvee' && dto.montantApprouve) {
      claim.montantApprouve = dto.montantApprouve;
    }
    claim.disputeReason = claim.disputeReason + ' (Résolu)';
    claim.reviewedAt = new Date();
    claim.reviewedBy = userId || 'unknown';
    if (dto.notes) {
      claim.notes = dto.notes;
    }

    await claim.save();
    await this.syncInvoiceFromClaim(claim, dto.resolution);

    await this.notifyClaimDecision(claim, this.decisionEventByStatus[dto.resolution]);

    return claim;
  }

  private async syncInvoiceFromClaim(claim: InsuranceClaimDocument, statut: string): Promise<void> {
    const claimId = (claim as any)._id.toString();
    const processedAt = ['approuvee', 'rejetee', 'remboursee', 'litige'].includes(statut) ? new Date() : undefined;

    try {
      await this.invoiceModel.findOneAndUpdate(
        { invoiceId: claim.invoiceId, deletedAt: null },
        {
          $set: {
            invoiceId: claim.invoiceId,
            invoiceNumber: claim.invoiceNumber,
            patientId: claim.patientId,
            patientName: claim.patientName,
            hospitalId: claim.hospitalId,
            actes: claim.actes || [],
            montantTotal: claim.montantTotal || 0,
            montantRembourse: claim.montantApprouve || 0,
            statut,
            claimId,
            claimNumber: claim.claimNumber,
            submittedAt: (claim as any).createdAt || new Date(),
            ...(processedAt ? { processedAt } : {}),
            ...(claim.rejectionReason ? { rejectionReason: claim.rejectionReason } : {}),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ).exec();
    } catch (error) {
      this.logger.error(`Failed to sync invoice ${claim.invoiceNumber} in IMS: ${error.message}`);
    }
  }

  private async notifyClaimDecision(
    claim: InsuranceClaimDocument,
    decision: 'approved' | 'rejected' | 'paid' | 'disputed',
  ): Promise<void> {
    try {
      await this.gatewayClient.notifyClaimDecision({
        claimId: (claim as any)._id.toString(),
        claimNumber: claim.claimNumber,
        decision,
        montantApprouve: claim.montantApprouve,
        rejectionReason: claim.rejectionReason || claim.disputeReason,
        hospitalId: claim.hospitalId,
      });
    } catch (error) {
      this.logger.error(`Failed to notify gateway of ${decision}: ${error.message}`);
    }
  }
}
