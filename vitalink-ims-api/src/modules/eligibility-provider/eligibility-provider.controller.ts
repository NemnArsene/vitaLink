import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EligibilityProviderService } from './eligibility-provider.service';
import { CheckEligibilityDto } from './dto/eligibility.dto';

@ApiTags('Eligibility Provider')
@ApiBearerAuth('access-token')
@Controller('eligibility')
export class EligibilityProviderController {
  constructor(private readonly eligibilityProviderService: EligibilityProviderService) {}

  @Post('check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vérifier l\'éligibilité d\'un assuré' })
  @ApiResponse({ status: 200, description: 'Éligibilité vérifiée avec succès' })
  checkEligibility(@Body() dto: CheckEligibilityDto) {
    return this.eligibilityProviderService.checkEligibility(dto);
  }
}
