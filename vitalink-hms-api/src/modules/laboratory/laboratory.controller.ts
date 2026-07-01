import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LaboratoryService } from './laboratory.service';
import { CreateLaboratoryDto, UpdateLaboratoryDto } from './dto/laboratory.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { StatusDto } from '../../common/dto/status.dto';

@ApiTags('Laboratory')
@Controller('laboratory')
export class LaboratoryController {
  constructor(private readonly laboratoryService: LaboratoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new laboratory exam request' })
  @ApiResponse({ status: 201, description: 'Exam request created successfully' })
  create(@Body() dto: CreateLaboratoryDto) {
    return this.laboratoryService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all laboratory exams' })
  @ApiQuery({ type: PaginationDto })
  @ApiQuery({ name: 'requestedBy', required: false })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('requestedBy') requestedBy?: string,
  ) {
    return this.laboratoryService.findAll(pagination, requestedBy);
  }

  @Get('doctor/:doctorName')
  @ApiOperation({ summary: 'Get exams requested by a specific doctor' })
  findByDoctor(@Param('doctorName') doctorName: string) {
    return this.laboratoryService.findByDoctor(doctorName);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get completed exams pending doctor notification' })
  getPendingResults() {
    return this.laboratoryService.getPendingResults();
  }

  @Get('status/:statut')
  @ApiOperation({ summary: 'Get exams by status' })
  getByStatus(@Param('statut') statut: string) {
    return this.laboratoryService.getByStatus(statut);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get exams by patient' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.laboratoryService.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exam by ID' })
  findOne(@Param('id') id: string) {
    return this.laboratoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update exam' })
  update(@Param('id') id: string, @Body() dto: UpdateLaboratoryDto) {
    return this.laboratoryService.update(id, dto);
  }

  @Post(':id/record-result')
  @ApiOperation({ summary: 'Record exam result' })
  recordResult(
    @Param('id') id: string,
    @Body() body: { resultValue: string; resultText: string; interpretedBy: string },
  ) {
    return this.laboratoryService.recordResult(id, body.resultValue, body.resultText, body.interpretedBy);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete laboratory exam' })
  remove(@Param('id') id: string) {
    return this.laboratoryService.remove(id);
  }

  @Post(':id/notify-doctor')
  @ApiOperation({ summary: 'Notify doctor that results are ready' })
  notifyDoctor(@Param('id') id: string) {
    return this.laboratoryService.notifyDoctor(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update exam status' })
  updateStatus(@Param('id') id: string, @Body() dto: StatusDto) {
    return this.laboratoryService.update(id, { statut: dto.statut } as any);
  }
}
