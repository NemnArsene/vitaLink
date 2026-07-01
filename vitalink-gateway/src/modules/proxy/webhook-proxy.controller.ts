import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProxyService } from '../proxy/proxy.service';
import { WebhookDto } from './dto/webhook.dto';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookProxyController {
  private readonly logger = new Logger(WebhookProxyController.name);

  constructor(private readonly proxyService: ProxyService) {}

  @Post('hms')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forward webhook to HMS API' })
  @ApiResponse({ status: 200, description: 'Webhook forwarded to HMS' })
  async forwardToHms(@Body() dto: WebhookDto) {
    this.logger.log(`Forwarding webhook to HMS: ${dto.eventType || 'unknown'}`);
    return this.proxyService.postHms('/webhooks/gateway', dto);
  }

  @Post('ims')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forward webhook to IMS API' })
  @ApiResponse({ status: 200, description: 'Webhook forwarded to IMS' })
  async forwardToIms(@Body() dto: WebhookDto) {
    this.logger.log(`Forwarding webhook to IMS: ${dto.eventType || 'unknown'}`);
    return this.proxyService.postIms('/webhooks/gateway', dto);
  }
}
