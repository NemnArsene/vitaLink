import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard KPIs' })
  getDashboard() {
    return this.dashboardService.getDashboard();
  }

  @Get('patient-stats')
  @ApiOperation({ summary: 'Get patient statistics' })
  getPatientStats() {
    return this.dashboardService.getPatientStats();
  }

  @Get('revenue-stats')
  @ApiOperation({ summary: 'Get revenue statistics' })
  getRevenueStats() {
    return this.dashboardService.getRevenueStats();
  }

  @Get('occupation-stats')
  @ApiOperation({ summary: 'Get bed occupation statistics' })
  getOccupationStats() {
    return this.dashboardService.getOccupationStats();
  }

  @Get('activity-stats')
  @ApiOperation({ summary: 'Get daily activity statistics' })
  getActivityStats() {
    return this.dashboardService.getActivityStats();
  }
}
