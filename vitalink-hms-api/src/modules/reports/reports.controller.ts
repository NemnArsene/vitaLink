import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/report.dto';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a report' })
  @ApiResponse({ status: 200, description: 'Report generated successfully' })
  generate(@Body() dto: GenerateReportDto) {
    return this.reportsService.generateReport(dto);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get activity report' })
  getActivity() {
    return this.reportsService.generateReport({ type: 'activity' } as GenerateReportDto);
  }

  @Get('billing')
  @ApiOperation({ summary: 'Get billing report' })
  getBilling() {
    return this.reportsService.generateReport({ type: 'billing' } as GenerateReportDto);
  }

  @Get('occupation')
  @ApiOperation({ summary: 'Get bed occupation report' })
  getOccupation() {
    return this.reportsService.generateReport({ type: 'occupation' } as GenerateReportDto);
  }
}
