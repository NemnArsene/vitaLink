import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InsuranceService } from './insurance.service';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@ApiTags('Insurance')
@Controller('insurance')
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @Get('companies')
  @ApiOperation({ summary: 'Get all insurance companies' })
  async getCompanies() {
    return this.insuranceService.getCompanies();
  }

  @Get('contracts')
  @ApiOperation({ summary: 'Get all insurance contracts' })
  async getContracts() {
    return this.insuranceService.getContracts();
  }
}
