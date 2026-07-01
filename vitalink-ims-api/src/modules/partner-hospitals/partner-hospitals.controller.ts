import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PartnerHospitalsService } from './partner-hospitals.service';
import { CreatePartnerHospitalDto, UpdatePartnerHospitalDto } from './dto/partner-hospital.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Partner Hospitals')
@ApiBearerAuth('access-token')
@Controller('partner-hospitals')
export class PartnerHospitalsController {
  constructor(private readonly partnerHospitalsService: PartnerHospitalsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a partner hospital' })
  @ApiResponse({ status: 201, description: 'Hospital added successfully' })
  create(@Body() dto: CreatePartnerHospitalDto) {
    return this.partnerHospitalsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all partner hospitals' })
  findAll(@Query() pagination: PaginationDto) {
    return this.partnerHospitalsService.findAll(pagination);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active partner hospitals' })
  getActive() {
    return this.partnerHospitalsService.findActive();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get hospital network statistics' })
  getStats() {
    return this.partnerHospitalsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get hospital by ID' })
  findOne(@Param('id') id: string) {
    return this.partnerHospitalsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update hospital' })
  update(@Param('id') id: string, @Body() dto: UpdatePartnerHospitalDto) {
    return this.partnerHospitalsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove hospital from network' })
  remove(@Param('id') id: string) {
    return this.partnerHospitalsService.remove(id);
  }
}
