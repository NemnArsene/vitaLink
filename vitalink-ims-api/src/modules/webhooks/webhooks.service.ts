import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WebhookEvent, WebhookEventDocument } from './schemas/webhook-event.schema';
import { InsuranceClaim, InsuranceClaimDocument } from '../claims-processing/schemas/insurance-claim.schema';
import { GatewayWebhookDto } from './dto/webhook.dto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectModel(WebhookEvent.name) private webhookEventModel: Model<WebhookEventDocument>,
    @InjectModel(InsuranceClaim.name) private claimModel: Model<InsuranceClaimDocument>,
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
        case 'CLAIM_SUBMITTED':
          await this.handleClaimSubmitted(dto.payload);
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

  private async handleClaimSubmitted(payload: any): Promise<void> {
    const { claimId, invoiceId, invoiceNumber, patientId, patientName, hospitalId, actes, montantTotal } = payload;

    // Check if claim already exists (idempotency)
    const existing = await this.claimModel.findOne({ invoiceId }).exec();
    if (existing) {
      this.logger.log(`Claim already exists for invoice ${invoiceId}, skipping`);
      return;
    }

    const claimNumber = await this.generateClaimNumber();

    const claim = new this.claimModel({
      claimNumber,
      claimId,
      invoiceId,
      invoiceNumber,
      patientId,
      patientName,
      hospitalId,
      actes,
      montantTotal,
      statut: 'recue',
    });

    await claim.save();
    this.logger.log(`Created new claim ${claimNumber} from invoice ${invoiceNumber}`);
  }

  private async generateClaimNumber(): Promise<string> {
    const date = new Date();
    const prefix = `CLM-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const count = await this.claimModel.countDocuments({ claimNumber: { $regex: prefix } });
    return `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }
}
