import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PoliciesService } from './policies.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@ApiTags('Policies')
@Controller('policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new insurance policy' })
  @ApiResponse({ status: 201, description: 'Policy created successfully' })
  create(@Body() createPolicyDto: CreatePolicyDto) {
    return this.policiesService.create(createPolicyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all policies' })
  @ApiQuery({ name: 'cardNumber', required: false, description: 'Filter by insurance card number' })
  findAll(@Query('cardNumber') cardNumber?: string) {
    if (cardNumber) {
      return this.policiesService.findByCardNumber(cardNumber);
    }
    return this.policiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get policy by ID' })
  findOne(@Param('id') id: string) {
    return this.policiesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update policy' })
  update(@Param('id') id: string, @Body() updatePolicyDto: UpdatePolicyDto) {
    return this.policiesService.update(id, updatePolicyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete policy' })
  remove(@Param('id') id: string) {
    return this.policiesService.remove(id);
  }
}
