import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EligibilityService } from './eligibility.service';
import { CheckEligibilityDto } from './dto/eligibility.dto';

@ApiTags('Eligibility')
@Controller('eligibility')
export class EligibilityController {
  constructor(private readonly eligibilityService: EligibilityService) {}

  @Post('check')
  @ApiOperation({ summary: 'Check patient insurance eligibility' })
  @ApiResponse({ status: 200, description: 'Eligibility check result' })
  check(@Body() dto: CheckEligibilityDto) {
    return this.eligibilityService.checkEligibility(dto);
  }
}
