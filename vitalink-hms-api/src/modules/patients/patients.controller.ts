import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Patients')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new patient and initialize medical record' })
  @ApiResponse({ status: 201, description: 'Patient created successfully' })
  create(@Body() createPatientDto: CreatePatientDto, @CurrentUser() user: JwtPayload) {
    return this.patientsService.create(createPatientDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all patients' })
  @ApiQuery({ type: PaginationDto })
  @ApiQuery({ name: 'mrn', required: false, description: 'Filter by Medical Record Number' })
  findAll(@Query() pagination: PaginationDto, @Query('mrn') mrn?: string) {
    if (mrn) {
      return this.patientsService.findByMedicalRecordNumber(mrn);
    }
    return this.patientsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update patient' })
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete patient' })
  remove(@Param('id') id: string) {
    return this.patientsService.remove(id);
  }
}
