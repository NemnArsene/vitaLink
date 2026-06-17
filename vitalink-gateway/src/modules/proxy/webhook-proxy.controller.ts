import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProxyService } from '../proxy/proxy.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookProxyController {
  private readonly logger = new Logger(WebhookProxyController.name);

  constructor(private readonly proxyService: ProxyService) {}

  @Post('hms')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forward webhook to HMS API' })
  @ApiResponse({ status: 200, description: 'Webhook forwarded to HMS' })
  async forwardToHms(@Body() body: any) {
    this.logger.log(`Forwarding webhook to HMS: ${body.eventType || 'unknown'}`);
    return this.proxyService.postHms('/webhooks/gateway', body);
  }

  @Post('ims')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forward webhook to IMS API' })
  @ApiResponse({ status: 200, description: 'Webhook forwarded to IMS' })
  async forwardToIms(@Body() body: any) {
    this.logger.log(`Forwarding webhook to IMS: ${body.eventType || 'unknown'}`);
    return this.proxyService.postIms('/webhooks/gateway', body);
  }
}
