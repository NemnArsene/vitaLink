import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportsImsService } from './reports-ims.service';
import { GenerateImsReportDto } from './dto/report-ims.dto';

@ApiTags('Reports IMS')
@Controller('reports')
export class ReportsImsController {
  constructor(private readonly reportsImsService: ReportsImsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate an insurance report' })
  generate(@Body() dto: GenerateImsReportDto) {
    return this.reportsImsService.generateReport(dto);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard KPIs' })
  getDashboard() {
    return this.reportsImsService.getDashboardKpis();
  }

  @Get('claims-overview')
  @ApiOperation({ summary: 'Get claims overview' })
  getClaimsOverview() {
    return this.reportsImsService.getClaimsOverview();
  }
}
