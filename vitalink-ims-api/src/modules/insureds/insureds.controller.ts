import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InsuredsService } from './insureds.service';
import { CreateInsuredDto, UpdateInsuredDto } from './dto/insured.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Insureds')
@ApiBearerAuth('access-token')
@Controller('insureds')
export class InsuredsController {
  constructor(private readonly insuredsService: InsuredsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new insured person' })
  @ApiResponse({ status: 201, description: 'Insured created successfully' })
  create(@Body() dto: CreateInsuredDto) {
    return this.insuredsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all insured persons' })
  findAll(@Query() pagination: PaginationDto) {
    return this.insuredsService.findAll(pagination);
  }

  @Get('policy/:policyId')
  @ApiOperation({ summary: 'Get insureds by policy' })
  findByPolicy(@Param('policyId') policyId: string) {
    return this.insuredsService.findByPolicy(policyId);
  }

  @Get('check-eligibility')
  @ApiOperation({ summary: 'Check insured eligibility' })
  checkEligibility(@Query('cardNumber') cardNumber: string) {
    return this.insuredsService.checkEligibility(cardNumber);
  }

  @Get('plafond/:id')
  @ApiOperation({ summary: 'Get insured remaining coverage' })
  getPlafond(@Param('id') id: string) {
    return this.insuredsService.getPlafondConsumption(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get insured by ID' })
  findOne(@Param('id') id: string) {
    return this.insuredsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update insured' })
  update(@Param('id') id: string, @Body() dto: UpdateInsuredDto) {
    return this.insuredsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete insured' })
  remove(@Param('id') id: string) {
    return this.insuredsService.remove(id);
  }
}
