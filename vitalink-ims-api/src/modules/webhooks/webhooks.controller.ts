import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { GatewayWebhookDto } from './dto/webhook.dto';

@ApiTags('Webhooks')
@ApiBearerAuth('access-token')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('gateway')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive webhook from Gateway' })
  @ApiResponse({ status: 200, description: 'Webhook received' })
  receiveGatewayWebhook(@Body() dto: GatewayWebhookDto) {
    return this.webhooksService.processGatewayWebhook(dto);
  }
}
