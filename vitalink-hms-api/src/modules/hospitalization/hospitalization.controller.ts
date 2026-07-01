import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { HospitalizationService } from './hospitalization.service';
import { CreateHospitalizationDto, UpdateHospitalizationDto } from './dto/hospitalization.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { StatusDto } from '../../common/dto/status.dto';

@ApiTags('Hospitalization')
@Controller('hospitalization')
export class HospitalizationController {
  constructor(private readonly hospitalizationService: HospitalizationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new hospitalization' })
  @ApiResponse({ status: 201, description: 'Hospitalization created successfully' })
  create(@Body() dto: CreateHospitalizationDto) {
    return this.hospitalizationService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all hospitalizations' })
  @ApiQuery({ type: PaginationDto })
  findAll(@Query() pagination: PaginationDto) {
    return this.hospitalizationService.findAll(pagination);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get currently hospitalized patients' })
  getCurrent() {
    return this.hospitalizationService.getCurrentPatients();
  }

  @Get('occupation')
  @ApiOperation({ summary: 'Get bed occupation by service' })
  getOccupation() {
    return this.hospitalizationService.getOccupationByService();
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get hospitalizations by patient' })
  findByPatient(@Param('patientId') patientId: string) {
    return this.hospitalizationService.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get hospitalization by ID' })
  findOne(@Param('id') id: string) {
    return this.hospitalizationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update hospitalization' })
  update(@Param('id') id: string, @Body() dto: UpdateHospitalizationDto) {
    return this.hospitalizationService.update(id, dto);
  }

  @Post(':id/discharge')
  @ApiOperation({ summary: 'Discharge patient' })
  discharge(@Param('id') id: string) {
    return this.hospitalizationService.discharge(id);
  }

  @Post(':id/produits')
  @ApiOperation({ summary: 'Add product used during hospitalization' })
  addProduit(
    @Param('id') id: string,
    @Body() dto: { produit: string; quantite: number; prixUnitaire: number; administeredBy: string },
  ) {
    return this.hospitalizationService.addProduit(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete hospitalization' })
  remove(@Param('id') id: string) {
    return this.hospitalizationService.remove(id);
  }

  @Post(':id/soins')
  @ApiOperation({ summary: 'Add care record' })
  addSoin(
    @Param('id') id: string,
    @Body() dto: { soin: string; par: string; notes?: string },
  ) {
    return this.hospitalizationService.addSoin(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update hospitalization status' })
  updateStatus(@Param('id') id: string, @Body() dto: StatusDto) {
    return this.hospitalizationService.update(id, { statut: dto.statut } as any);
  }
}
