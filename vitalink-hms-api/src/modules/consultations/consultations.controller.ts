import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto, UpdateConsultationDto } from './dto/consultation.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { StatusDto } from '../../common/dto/status.dto';

@ApiTags('Consultations')
@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new consultation' })
  @ApiResponse({ status: 201, description: 'Consultation created successfully' })
  create(@Body() dto: CreateConsultationDto) {
    return this.consultationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all consultations' })
  @ApiQuery({ type: PaginationDto })
  findAll(@Query() pagination: PaginationDto) {
    return this.consultationsService.findAll(pagination);
  }

  @Get('doctor/:doctorName')
  @ApiOperation({ summary: 'Get consultations by doctor' })
  findByDoctor(@Param('doctorName') doctorName: string) {
    return this.consultationsService.findByDoctor(doctorName);
  }

  @Get('doctor/:doctorName/daily')
  @ApiOperation({ summary: 'Get doctor daily patient list' })
  @ApiQuery({ name: 'date', required: false })
  getDoctorDailyList(
    @Param('doctorName') doctorName: string,
    @Query('date') date?: string,
  ) {
    const queryDate = date ? new Date(date) : new Date();
    return this.consultationsService.getDoctorDailyList(doctorName, queryDate);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get consultations by patient' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.consultationsService.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get consultation by ID' })
  findOne(@Param('id') id: string) {
    return this.consultationsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update consultation (full replace)' })
  updatePut(@Param('id') id: string, @Body() dto: UpdateConsultationDto) {
    return this.consultationsService.update(id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update consultation (partial)' })
  update(@Param('id') id: string, @Body() dto: UpdateConsultationDto) {
    return this.consultationsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete consultation' })
  remove(@Param('id') id: string) {
    return this.consultationsService.remove(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update consultation status' })
  updateStatus(@Param('id') id: string, @Body() dto: StatusDto) {
    return this.consultationsService.update(id, { status: dto.statut } as any);
  }
}
