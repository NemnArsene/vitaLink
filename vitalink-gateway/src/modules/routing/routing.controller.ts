import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RoutingService } from './routing.service';
import { Scopes } from '../../common/decorators/roles.decorator';
import { Scope } from '../../common/enums/roles.enum';
import { CreateRoutingDto } from './dto/create-routing.dto';
import { UpdateRoutingDto } from './dto/update-routing.dto';

@ApiTags('Routing')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('routing')
export class RoutingController {
  constructor(private readonly routingService: RoutingService) {}

  @Post()
  @Scopes(Scope.ADMIN)
  @ApiOperation({ summary: 'Create a routing configuration' })
  create(@Body() dto: CreateRoutingDto) {
    return this.routingService.create(dto);
  }

  @Get()
  @Scopes(Scope.ADMIN)
  @ApiOperation({ summary: 'Get all routing configurations' })
  findAll() {
    return this.routingService.findAll();
  }

  @Get('stats')
  @Scopes(Scope.ADMIN)
  @ApiOperation({ summary: 'Get routing statistics' })
  getStats() {
    return this.routingService.getStats();
  }

  @Get('hospital/:hospitalId')
  @Scopes(Scope.ADMIN, Scope.HOSPITAL)
  @ApiOperation({ summary: 'Get routes for a hospital' })
  findByHospital(@Param('hospitalId') hospitalId: string) {
    return this.routingService.findByHospital(hospitalId);
  }

  @Get('insurance/:insuranceProviderId')
  @Scopes(Scope.ADMIN, Scope.INSURANCE)
  @ApiOperation({ summary: 'Get routes for an insurance provider' })
  findByInsurance(@Param('insuranceProviderId') insuranceProviderId: string) {
    return this.routingService.findByInsurance(insuranceProviderId);
  }

  @Get(':id')
  @Scopes(Scope.ADMIN)
  @ApiOperation({ summary: 'Get routing config by ID' })
  findOne(@Param('id') id: string) {
    return this.routingService.findOne(id);
  }

  @Put(':id')
  @Scopes(Scope.ADMIN)
  @ApiOperation({ summary: 'Update routing config' })
  update(@Param('id') id: string, @Body() dto: UpdateRoutingDto) {
    return this.routingService.update(id, dto);
  }

  @Delete(':id')
  @Scopes(Scope.ADMIN)
  @ApiOperation({ summary: 'Delete routing config' })
  remove(@Param('id') id: string) {
    return this.routingService.remove(id);
  }
}
