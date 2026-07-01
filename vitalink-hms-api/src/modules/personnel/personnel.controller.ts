import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PersonnelService } from './personnel.service';
import { CreatePersonnelDto, UpdatePersonnelDto } from './dto/personnel.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Personnel')
@Controller('personnel')
export class PersonnelController {
  constructor(private readonly personnelService: PersonnelService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new personnel member' })
  @ApiResponse({ status: 201, description: 'Personnel created successfully' })
  create(@Body() dto: CreatePersonnelDto) {
    return this.personnelService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all personnel' })
  @ApiQuery({ type: PaginationDto })
  @ApiQuery({ name: 'service', required: false })
  @ApiQuery({ name: 'role', required: false })
  findAll(@Query() pagination: PaginationDto, @Query('service') service?: string, @Query('role') role?: string) {
    return this.personnelService.findAll(pagination, service, role);
  }

  @Get('doctors')
  @ApiOperation({ summary: 'Get all doctors' })
  getDoctors() {
    return this.personnelService.getDoctors();
  }

  @Get('by-service')
  @ApiOperation({ summary: 'Get personnel grouped by service' })
  getByService() {
    return this.personnelService.getByService();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get personnel by ID' })
  findOne(@Param('id') id: string) {
    return this.personnelService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update personnel' })
  update(@Param('id') id: string, @Body() dto: UpdatePersonnelDto) {
    return this.personnelService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete personnel' })
  remove(@Param('id') id: string) {
    return this.personnelService.remove(id);
  }

  @Post(':id/planning')
  @ApiOperation({ summary: 'Update staff schedule' })
  updatePlanning(@Param('id') id: string, @Body() planning: { jour: string; debut: string; fin: string }[]) {
    return this.personnelService.updatePlanning(id, planning);
  }
}
