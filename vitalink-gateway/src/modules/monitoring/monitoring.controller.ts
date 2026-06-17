import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class MonitoringController {
  @Public()
  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns gateway health status',
  })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  healthCheck() {
    return {
      status: 'ok',
      service: 'vitalink-gateway',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
    };
  }

  @Public()
  @Get('ready')
  @ApiOperation({
    summary: 'Readiness probe',
    description: 'Kubernetes readiness probe endpoint',
  })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  readinessCheck() {
    return {
      status: 'ready',
      service: 'vitalink-gateway',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('live')
  @ApiOperation({
    summary: 'Liveness probe',
    description: 'Kubernetes liveness probe endpoint',
  })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  livenessCheck() {
    return {
      status: 'alive',
      service: 'vitalink-gateway',
      timestamp: new Date().toISOString(),
    };
  }
}
