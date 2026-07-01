import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check' })
  check() {
    return this.healthService.check();
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness check' })
  ready() {
    return this.healthService.ready();
  }
}
