import { Controller, Get, Post, Patch, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TriageService } from './triage.service';
import { CreateTriageDto, UpdateTriageDto } from './dto/triage.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { StatusDto } from '../../common/dto/status.dto';

@ApiTags('Triage')
@Controller('triage')
export class TriageController {
  constructor(private readonly triageService: TriageService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new triage entry' })
  @ApiResponse({ status: 201, description: 'Triage created successfully' })
  create(@Body() dto: CreateTriageDto) {
    return this.triageService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all triage entries' })
  @ApiQuery({ type: PaginationDto })
  findAll(@Query() pagination: PaginationDto) {
    return this.triageService.findAll(pagination);
  }

  @Get('waiting-list')
  @ApiOperation({ summary: 'Get waiting list (patients not yet seen by doctor)' })
  getWaitingList() {
    return this.triageService.getWaitingList();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get triage by ID' })
  findOne(@Param('id') id: string) {
    return this.triageService.findOne(id);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get triages by patient' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.triageService.findByPatient(patientId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update triage entry' })
  update(@Param('id') id: string, @Body() dto: UpdateTriageDto) {
    return this.triageService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete triage entry' })
  remove(@Param('id') id: string) {
    return this.triageService.remove(id);
  }

  @Patch(':id/mark-seen')
  @ApiOperation({ summary: 'Mark triage as seen by doctor' })
  markAsSeen(@Param('id') id: string) {
    return this.triageService.markAsSeen(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update triage status' })
  updateStatus(@Param('id') id: string, @Body() dto: StatusDto) {
    return this.triageService.updateStatus(id, dto.statut);
  }
}
