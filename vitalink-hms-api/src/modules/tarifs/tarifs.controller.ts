import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TarifsService } from './tarifs.service';
import { CreateTarifDto, UpdateTarifDto } from './dto/tarif.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Tarifs')
@Controller('tarifs')
export class TarifsController {
  constructor(private readonly tarifsService: TarifsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tarif' })
  @ApiResponse({ status: 201, description: 'Tarif created successfully' })
  create(@Body() dto: CreateTarifDto) {
    return this.tarifsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tarifs' })
  @ApiQuery({ type: PaginationDto })
  findAll(@Query() pagination: PaginationDto) {
    return this.tarifsService.findAll(pagination);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active tarifs' })
  getActive() {
    return this.tarifsService.findActive();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get tarifs by category' })
  findByCategory(@Param('category') category: string) {
    return this.tarifsService.findByCategory(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tarif by ID' })
  findOne(@Param('id') id: string) {
    return this.tarifsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update tarif' })
  update(@Param('id') id: string, @Body() dto: UpdateTarifDto) {
    return this.tarifsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tarif' })
  remove(@Param('id') id: string) {
    return this.tarifsService.remove(id);
  }
}
