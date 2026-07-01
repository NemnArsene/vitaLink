import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto, UpdatePrescriptionDto } from './dto/prescription.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Prescriptions')
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new prescription' })
  @ApiResponse({ status: 201, description: 'Prescription created successfully' })
  create(@Body() dto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all prescriptions' })
  @ApiQuery({ type: PaginationDto })
  findAll(@Query() pagination: PaginationDto) {
    return this.prescriptionsService.findAll(pagination);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get prescriptions by patient' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.prescriptionsService.findByPatient(patientId);
  }

  @Get('doctor/:doctorName')
  @ApiOperation({ summary: 'Get prescriptions by doctor' })
  findByDoctor(@Param('doctorName') doctorName: string) {
    return this.prescriptionsService.findByDoctor(doctorName);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get prescription by ID' })
  findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update prescription' })
  update(@Param('id') id: string, @Body() dto: UpdatePrescriptionDto) {
    return this.prescriptionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete prescription' })
  remove(@Param('id') id: string) {
    return this.prescriptionsService.remove(id);
  }

  @Post(':id/invalidate')
  @ApiOperation({ summary: 'Invalidate prescription' })
  invalidate(@Param('id') id: string) {
    return this.prescriptionsService.invalidate(id);
  }
}
