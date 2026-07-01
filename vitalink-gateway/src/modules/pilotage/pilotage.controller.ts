import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PilotageService } from './pilotage.service';
import { Scopes } from '../../common/decorators/roles.decorator';
import { Scope } from '../../common/enums/roles.enum';

@ApiTags('Pilotage')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('pilotage')
export class PilotageController {
  constructor(private readonly pilotageService: PilotageService) {}

  @Get('dashboard')
  @Scopes(Scope.ADMIN)
  @ApiOperation({ summary: 'Get aggregated cross-platform dashboard' })
  getDashboard() {
    return this.pilotageService.getAggregatedDashboard();
  }

  @Get('health')
  @ApiOperation({ summary: 'Get health status of all services' })
  getHealth() {
    return this.pilotageService.getHealthStatus();
  }

  @Get('stats')
  @Scopes(Scope.ADMIN)
  @ApiOperation({ summary: 'Get cross-platform statistics' })
  getStats() {
    return this.pilotageService.getCrossPlatformStats();
  }
}
