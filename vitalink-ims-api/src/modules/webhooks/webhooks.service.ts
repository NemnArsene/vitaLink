import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebhookEvent, WebhookEventDocument } from './schemas/webhook-event.schema';
import { InsuranceClaim, InsuranceClaimDocument } from '../claims-processing/schemas/insurance-claim.schema';
import { Invoice, InvoiceDocument } from '../invoices/schemas/invoice.schema';
import { GatewayWebhookDto } from './dto/webhook.dto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectModel(WebhookEvent.name) private webhookEventModel: Model<WebhookEventDocument>,
    @InjectModel(InsuranceClaim.name) private claimModel: Model<InsuranceClaimDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  async processGatewayWebhook(dto: GatewayWebhookDto): Promise<{ received: boolean; message: string; claimId?: string }> {
    const event = new this.webhookEventModel({
      eventType: dto.eventType,
      source: dto.source,
      payload: dto.payload,
      status: 'received',
    });
    await event.save();

    this.logger.log(`Received webhook event: ${dto.eventType} from ${dto.source}`);

    let claimId: string | undefined;

    try {
      switch (dto.eventType) {
        case 'CLAIM_SUBMITTED': {
          const claim = await this.handleClaimSubmitted(dto.payload);
          claimId = (claim as any)?._id?.toString();
          break;
        }
        default:
          this.logger.warn(`Unknown event type: ${dto.eventType}`);
      }

      event.status = 'processed';
      event.processedAt = new Date();
      await event.save();

      return { received: true, message: `Event ${dto.eventType} processed successfully`, claimId };
    } catch (error) {
      event.status = 'failed';
      event.error = error.message;
      await event.save();
      throw error;
    }
  }

  private async handleClaimSubmitted(payload: any): Promise<InsuranceClaimDocument> {
    const { invoiceId, invoiceNumber, patientId, patientName, hospitalId, hospitalName, actes, montantTotal } = payload;

    // Check if claim already exists (idempotency)
    const existing = await this.claimModel.findOne({ invoiceId }).exec();
    if (existing) {
      this.logger.log(`Claim already exists for invoice ${invoiceId}, skipping`);
      await this.syncInvoiceFromClaim(existing, hospitalName);
      return existing;
    }

    const claimNumber = await this.generateClaimNumber();

    const claim = new this.claimModel({
      claimNumber,
      invoiceId,
      invoiceNumber,
      patientId,
      patientName,
      hospitalId,
      actes: actes || [],
      montantTotal: montantTotal || 0,
      statut: 'recue',
    });

    const saved = await claim.save();
    await this.syncInvoiceFromClaim(saved, hospitalName);
    this.logger.log(`Created new claim ${claimNumber} from invoice ${invoiceNumber}`);
    return saved;
  }

  private async syncInvoiceFromClaim(claim: InsuranceClaimDocument, hospitalName?: string): Promise<void> {
    await this.invoiceModel.findOneAndUpdate(
      { invoiceId: claim.invoiceId, deletedAt: null },
      {
        $set: {
          invoiceId: claim.invoiceId,
          invoiceNumber: claim.invoiceNumber,
          patientId: claim.patientId,
          patientName: claim.patientName,
          hospitalId: claim.hospitalId,
          hospitalName: hospitalName || '',
          actes: claim.actes || [],
          montantTotal: claim.montantTotal || 0,
          montantRembourse: claim.montantApprouve || 0,
          statut: claim.statut || 'recue',
          claimId: (claim as any)._id.toString(),
          claimNumber: claim.claimNumber,
          submittedAt: (claim as any).createdAt || new Date(),
          ...(claim.rejectionReason ? { rejectionReason: claim.rejectionReason } : {}),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).exec();
  }

  private async generateClaimNumber(): Promise<string> {
    const date = new Date();
    const prefix = `CLM-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const count = await this.claimModel.countDocuments({ claimNumber: { $regex: prefix } });
    return `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }
}
