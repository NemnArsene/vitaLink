import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EligibilityProviderService } from './eligibility-provider.service';
import { CheckEligibilityDto } from './dto/eligibility.dto';

@ApiTags('Eligibility Provider')
@Controller('eligibility')
export class EligibilityProviderController {
  constructor(private readonly eligibilityProviderService: EligibilityProviderService) {}

  @Post('check')
  @ApiOperation({ summary: 'Check insurance eligibility (called by Gateway)' })
  @ApiResponse({ status: 200, description: 'Eligibility check result' })
  check(@Body() dto: CheckEligibilityDto) {
    return this.eligibilityProviderService.checkEligibility(dto);
  }
}
