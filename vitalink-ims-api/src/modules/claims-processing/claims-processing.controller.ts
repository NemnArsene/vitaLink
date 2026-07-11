import { Controller, Get, Param, Post, Put, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClaimsProcessingService } from './claims-processing.service';
import { ApproveClaimDto, RejectClaimDto, AnalyzeClaimDto, PayClaimDto, DisputeClaimDto, ResolveDisputeDto } from './dto/claim-action.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Scopes } from '../../common/decorators/roles.decorator';
import { Scope } from '../../common/enums/roles.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Claims Processing')
@ApiBearerAuth('access-token')
@Controller('claims-processing')
export class ClaimsProcessingController {
  constructor(private readonly claimsProcessingService: ClaimsProcessingService) {}

  @Get()
  @Scopes(Scope.INSURANCE)
  @ApiOperation({ summary: 'Get all insurance claims' })
  findAll(@Query('status') status?: string, @Query() pagination?: PaginationDto) {
    return this.claimsProcessingService.findAll(status, pagination);
  }

  @Post()
  @Scopes(Scope.INSURANCE)
  @ApiOperation({ summary: 'Create a new claim from invoice submission' })
  create(@Body() dto: CreateClaimDto) {
    return this.claimsProcessingService.create(dto);
  }

  @Get(':id')
  @Scopes(Scope.INSURANCE)
  @ApiOperation({ summary: 'Get claim by ID' })
  findOne(@Param('id') id: string) {
    return this.claimsProcessingService.findOne(id);
  }

  @Post(':id/approve')
  @Scopes(Scope.INSURANCE)
  @Roles('DIRECTEUR', 'MANAGER')
  @ApiOperation({ summary: 'Approve a claim (DIRECTEUR or MANAGER only)' })
  approve(@Param('id') id: string, @Body() dto: ApproveClaimDto, @CurrentUser() user: JwtPayload) {
    return this.claimsProcessingService.approve(id, dto, user?.sub);
  }

  @Post(':id/reject')
  @Scopes(Scope.INSURANCE)
  @Roles('DIRECTEUR', 'MANAGER')
  @ApiOperation({ summary: 'Reject a claim (DIRECTEUR or MANAGER only)' })
  reject(@Param('id') id: string, @Body() dto: RejectClaimDto, @CurrentUser() user: JwtPayload) {
    return this.claimsProcessingService.reject(id, dto, user?.sub);
  }

  @Post(':id/analyze')
  @Scopes(Scope.INSURANCE)
  @Roles('MANAGER')
  @ApiOperation({ summary: 'Send a claim to analysis (MANAGER only) — status: recue → en_revision' })
  analyze(@Param('id') id: string, @Body() dto: AnalyzeClaimDto, @CurrentUser() user: JwtPayload) {
    return this.claimsProcessingService.analyze(id, dto, user?.sub);
  }

  @Post(':id/pay')
  @Scopes(Scope.INSURANCE)
  @Roles('DIRECTEUR')
  @ApiOperation({ summary: 'Pay an approved claim (DIRECTEUR only) — status: approuvee → remboursee' })
  pay(@Param('id') id: string, @Body() dto: PayClaimDto, @CurrentUser() user: JwtPayload) {
    return this.claimsProcessingService.pay(id, dto, user?.sub);
  }

  @Put(':id/dispute')
  @Scopes(Scope.INSURANCE)
  @Roles('MANAGER', 'DIRECTEUR')
  @ApiOperation({ summary: 'Flag a claim as disputed (MANAGER or DIRECTEUR only)' })
  dispute(@Param('id') id: string, @Body() dto: DisputeClaimDto, @CurrentUser() user: JwtPayload) {
    return this.claimsProcessingService.dispute(id, dto, user?.sub);
  }

  @Post(':id/resolve-dispute')
  @Scopes(Scope.INSURANCE)
  @Roles('DIRECTEUR')
  @ApiOperation({ summary: 'Resolve a disputed claim (DIRECTEUR only) — status: litige → approuvee or rejetee' })
  resolveDispute(@Param('id') id: string, @Body() dto: ResolveDisputeDto, @CurrentUser() user: JwtPayload) {
    return this.claimsProcessingService.resolveDispute(id, dto, user?.sub);
  }
}
