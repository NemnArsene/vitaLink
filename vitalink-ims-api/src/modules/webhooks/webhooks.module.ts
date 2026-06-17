import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WebhookEvent, WebhookEventSchema } from './schemas/webhook-event.schema';
import { InsuranceClaim, InsuranceClaimSchema } from '../claims-processing/schemas/insurance-claim.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WebhookEvent.name, schema: WebhookEventSchema },
      { name: InsuranceClaim.name, schema: InsuranceClaimSchema },
    ]),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
