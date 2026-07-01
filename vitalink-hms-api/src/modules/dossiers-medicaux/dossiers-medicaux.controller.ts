import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DossiersMedicauxService } from './dossiers-medicaux.service';
import { CreateDossierDto } from './dto/create-dossier.dto';
import { AddSoinDto } from './dto/add-soin.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { Scopes } from '../../common/decorators/roles.decorator';
import { Scope } from '../../common/enums/roles.enum';

@ApiTags('Dossiers Médicaux')
@ApiBearerAuth('access-token')
@Controller('patients/:patientId/dossiers')
export class DossiersMedicauxController {
  constructor(private readonly dossiersMedicauxService: DossiersMedicauxService) {}

  @Post()
  @Scopes(Scope.HOSPITAL)
  @ApiOperation({ summary: 'Create a new medical visit record for a patient' })
  @ApiResponse({ status: 201, description: 'Medical record created successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  create(
    @Param('patientId') patientId: string,
    @Body() createDossierDto: CreateDossierDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.dossiersMedicauxService.create(patientId, createDossierDto, user);
  }

  @Post(':dossierId/soins')
  @Scopes(Scope.HOSPITAL)
  @ApiOperation({ summary: 'Add a treatment/care to an existing medical record' })
  @ApiResponse({ status: 201, description: 'Treatment added successfully' })
  @ApiResponse({ status: 400, description: 'Medical record is closed' })
  @ApiResponse({ status: 404, description: 'Medical record not found' })
  addSoin(
    @Param('patientId') patientId: string,
    @Param('dossierId') dossierId: string,
    @Body() addSoinDto: AddSoinDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.dossiersMedicauxService.addSoin(patientId, dossierId, addSoinDto, user);
  }

  @Get()
  @Scopes(Scope.HOSPITAL)
  @ApiOperation({ summary: 'Get complete medical history for a patient (chronological)' })
  @ApiResponse({ status: 200, description: 'Medical history retrieved' })
  findAll(@Param('patientId') patientId: string) {
    return this.dossiersMedicauxService.findAllByPatient(patientId);
  }

  @Get(':dossierId')
  @Scopes(Scope.HOSPITAL)
  @ApiOperation({ summary: 'Get full details of a specific medical visit' })
  @ApiResponse({ status: 200, description: 'Medical record details retrieved' })
  @ApiResponse({ status: 404, description: 'Medical record not found' })
  findOne(
    @Param('patientId') patientId: string,
    @Param('dossierId') dossierId: string,
  ) {
    return this.dossiersMedicauxService.findOne(patientId, dossierId);
  }
}
