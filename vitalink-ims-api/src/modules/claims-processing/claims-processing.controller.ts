import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClaimsProcessingService } from './claims-processing.service';
import { ApproveClaimDto, RejectClaimDto } from './dto/claim-action.dto';

@ApiTags('Claims Processing')
@Controller('claims-processing')
export class ClaimsProcessingController {
  constructor(private readonly claimsProcessingService: ClaimsProcessingService) {}

  @Get()
  @ApiOperation({ summary: 'Get all insurance claims' })
  findAll() {
    return this.claimsProcessingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get claim by ID' })
  findOne(@Param('id') id: string) {
    return this.claimsProcessingService.findOne(id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a claim' })
  approve(@Param('id') id: string, @Body() dto: ApproveClaimDto) {
    return this.claimsProcessingService.approve(id, dto);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a claim' })
  reject(@Param('id') id: string, @Body() dto: RejectClaimDto) {
    return this.claimsProcessingService.reject(id, dto);
  }
}
