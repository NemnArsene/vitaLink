import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebhookEvent, WebhookEventDocument } from './schemas/webhook-event.schema';
import { GatewayWebhookDto } from './dto/webhook.dto';
import { Invoice, InvoiceDocument } from '../billing/schemas/invoice.schema';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectModel(WebhookEvent.name) private webhookEventModel: Model<WebhookEventDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  async processGatewayWebhook(dto: GatewayWebhookDto): Promise<{ received: boolean; message: string }> {
    // Store webhook event
    const event = new this.webhookEventModel({
      eventType: dto.eventType,
      source: dto.source,
      payload: dto.payload,
      status: 'received',
    });
    await event.save();

    this.logger.log(`Received webhook event: ${dto.eventType} from ${dto.source}`);

    try {
      switch (dto.eventType) {
        case 'CLAIM_APPROVED':
          await this.handleClaimApproved(dto.payload);
          break;
        case 'CLAIM_REJECTED':
          await this.handleClaimRejected(dto.payload);
          break;
        case 'CLAIM_PROCESSED':
          await this.handleClaimProcessed(dto.payload);
          break;
        case 'CLAIM_DISPUTED':
          await this.handleClaimDisputed(dto.payload);
          break;
        default:
          this.logger.warn(`Unknown event type: ${dto.eventType}`);
      }

      event.status = 'processed';
      event.processedAt = new Date();
      await event.save();

      return { received: true, message: `Event ${dto.eventType} processed successfully` };
    } catch (error) {
      event.status = 'failed';
      event.error = error.message;
      await event.save();
      throw error;
    }
  }

  private async handleClaimApproved(payload: any): Promise<void> {
    const { claimId, claimNumber, invoiceId, invoiceNumber, montantRembourse } = payload;
    this.logger.log(`Claim ${claimId} approved - Montant remboursé: ${montantRembourse}`);

    await this.invoiceModel.findOneAndUpdate(
      this.buildInvoiceLookup(claimId, claimNumber, invoiceId, invoiceNumber),
      {
        statut: 'approuvee',
        montantRembourse: montantRembourse || 0,
        processedAt: new Date(),
      },
    );
  }

  private async handleClaimRejected(payload: any): Promise<void> {
    const { claimId, claimNumber, invoiceId, invoiceNumber, rejectionReason } = payload;
    this.logger.log(`Claim ${claimId} rejected - Reason: ${rejectionReason}`);

    await this.invoiceModel.findOneAndUpdate(
      this.buildInvoiceLookup(claimId, claimNumber, invoiceId, invoiceNumber),
      {
        statut: 'rejetee',
        rejectionReason,
        processedAt: new Date(),
      },
    );
  }

  private async handleClaimProcessed(payload: any): Promise<void> {
    const { claimId, claimNumber, invoiceId, invoiceNumber } = payload;
    this.logger.log(`Claim ${claimId} processed`);

    await this.invoiceModel.findOneAndUpdate(
      this.buildInvoiceLookup(claimId, claimNumber, invoiceId, invoiceNumber),
      {
        statut: 'remboursee',
        processedAt: new Date(),
      },
    );
  }

  private async handleClaimDisputed(payload: any): Promise<void> {
    const { claimId, claimNumber, invoiceId, invoiceNumber, rejectionReason } = payload;
    this.logger.log(`Claim ${claimId} disputed - Reason: ${rejectionReason}`);

    await this.invoiceModel.findOneAndUpdate(
      this.buildInvoiceLookup(claimId, claimNumber, invoiceId, invoiceNumber),
      {
        statut: 'litige',
        rejectionReason: rejectionReason || 'Litige ouvert par l\'assurance',
        processedAt: new Date(),
      },
    );
  }

  private buildInvoiceLookup(claimId?: string, claimNumber?: string, invoiceId?: string, invoiceNumber?: string): any {
    const filters = [
      claimId ? { insuranceClaimId: claimId } : null,
      claimNumber ? { insuranceClaimId: claimNumber } : null,
      invoiceId ? { _id: invoiceId } : null,
      invoiceNumber ? { invoiceNumber } : null,
    ].filter(Boolean);

    return filters.length === 1 ? filters[0] : { $or: filters };
  }
}
