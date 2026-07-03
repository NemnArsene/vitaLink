import { Controller, Post, Get, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProxyService } from '../proxy/proxy.service';
import { Scopes } from '../../common/decorators/roles.decorator';
import { Scope } from '../../common/enums/roles.enum';
import { Request } from 'express';
import { EligibilityCheckDto } from './dto/eligibility-check.dto';
import { SubmitClaimDto } from './dto/submit-claim.dto';
import { ClaimDecisionDto } from './dto/claim-decision.dto';
import { ApproveClaimDto } from './dto/approve-claim.dto';
import { RejectClaimDto } from './dto/reject-claim.dto';
import { DisputeClaimDto } from './dto/dispute-claim.dto';

@ApiTags('API Gateway')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller()
export class ApiController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('eligibility/check')
  @Scopes(Scope.HOSPITAL, Scope.ADMIN)
  @ApiOperation({ summary: 'Check insurance eligibility (proxied to IMS) — English alias' })
  async checkEligibilityEn(@Req() req: Request, @Body() dto: EligibilityCheckDto) {
    return this.proxyService.forwardRequest('ims', {
      method: 'POST',
      path: '/api/v1/eligibility/check',
      body: dto,
      headers: { 'x-request-id': (req.headers['x-request-id'] as string) || '' },
    });
  }

  @Post('eligibilite/check')
  @Scopes(Scope.HOSPITAL, Scope.ADMIN)
  @ApiOperation({ summary: 'Check insurance eligibility (proxied to IMS)' })
  async checkEligibility(@Req() req: Request, @Body() dto: EligibilityCheckDto) {
    return this.proxyService.forwardRequest('ims', {
      method: 'POST',
      path: '/api/v1/eligibility/check',
      body: dto,
      headers: { 'x-request-id': (req.headers['x-request-id'] as string) || '' },
    });
  }

  @Post('claims')
  @Scopes(Scope.HOSPITAL, Scope.ADMIN)
  @ApiOperation({ summary: 'Submit claim (proxied to IMS) — English alias' })
  async submitClaimEn(@Req() req: Request, @Body() dto: SubmitClaimDto) {
    return this.proxyService.forwardRequest('ims', {
      method: 'POST',
      path: '/claims-processing',
      body: dto,
      headers: { 'x-request-id': (req.headers['x-request-id'] as string) || '' },
    });
  }

  @Post('remboursement/soumettre')
  @Scopes(Scope.HOSPITAL, Scope.ADMIN)
  @ApiOperation({ summary: 'Submit reimbursement claim (proxied to IMS)' })
  async submitClaim(@Req() req: Request, @Body() dto: SubmitClaimDto) {
    return this.proxyService.forwardRequest('ims', {
      method: 'POST',
      path: '/claims-processing',
      body: dto,
      headers: { 'x-request-id': (req.headers['x-request-id'] as string) || '' },
    });
  }

  @Post('claims/:claimId/decision')
  @Scopes(Scope.INSURANCE, Scope.ADMIN)
  @ApiOperation({ summary: 'Receive claim decision and forward as webhook to HMS' })
  async claimDecision(@Req() req: Request, @Param('claimId') claimId: string, @Body() dto: ClaimDecisionDto) {
    const isApproved = dto.decision === 'approved';
    return this.proxyService.forwardRequest('hms', {
      method: 'POST',
      path: '/webhooks/gateway',
      body: {
        eventType: isApproved ? 'CLAIM_APPROVED' : 'CLAIM_REJECTED',
        source: 'vitalink-gateway',
        payload: {
          claimId,
          claimNumber: dto.claimNumber,
          montantRembourse: dto.montantApprouve,
          rejectionReason: dto.rejectionReason,
          hospitalId: dto.hospitalId,
        },
        timestamp: new Date().toISOString(),
      },
      headers: { 'x-request-id': (req.headers['x-request-id'] as string) || '' },
    });
  }

  @Get('remboursement/:id')
  @Scopes(Scope.HOSPITAL, Scope.INSURANCE, Scope.ADMIN)
  @ApiOperation({ summary: 'Get claim details (proxied to IMS)' })
  async getClaim(@Req() req: Request, @Param('id') id: string) {
    return this.proxyService.forwardRequest('ims', {
      method: 'GET',
      path: `/claims-processing/${id}`,
      headers: { 'x-request-id': (req.headers['x-request-id'] as string) || '' },
    });
  }

  @Put('remboursement/:id/approuver')
  @Scopes(Scope.INSURANCE, Scope.ADMIN)
  @ApiOperation({ summary: 'Approve a claim (proxied to IMS)' })
  async approveClaim(@Req() req: Request, @Param('id') id: string, @Body() dto: ApproveClaimDto) {
    return this.proxyService.forwardRequest('ims', {
      method: 'POST',
      path: `/claims-processing/${id}/approve`,
      body: dto,
      headers: { 'x-request-id': (req.headers['x-request-id'] as string) || '' },
    });
  }

  @Put('remboursement/:id/rejeter')
  @Scopes(Scope.INSURANCE, Scope.ADMIN)
  @ApiOperation({ summary: 'Reject a claim (proxied to IMS)' })
  async rejectClaim(@Req() req: Request, @Param('id') id: string, @Body() dto: RejectClaimDto) {
    return this.proxyService.forwardRequest('ims', {
      method: 'POST',
      path: `/claims-processing/${id}/reject`,
      body: dto,
      headers: { 'x-request-id': (req.headers['x-request-id'] as string) || '' },
    });
  }

  @Put('remboursement/:id/litige')
  @Scopes(Scope.HOSPITAL, Scope.INSURANCE, Scope.ADMIN)
  @ApiOperation({ summary: 'Flag a claim as disputed (proxied to IMS)' })
  async disputeClaim(@Req() req: Request, @Param('id') id: string, @Body() dto: DisputeClaimDto) {
    return this.proxyService.forwardRequest('ims', {
      method: 'PUT',
      path: `/claims-processing/${id}/dispute`,
      body: dto,
      headers: { 'x-request-id': (req.headers['x-request-id'] as string) || '' },
    });
  }

  @Get('hopitaux/:id/statut')
  @Scopes(Scope.INSURANCE, Scope.ADMIN)
  @ApiOperation({ summary: 'Check hospital network status (proxied to HMS)' })
  async getHospitalStatus(@Req() req: Request, @Param('id') id: string) {
    return this.proxyService.forwardRequest('hms', {
      method: 'GET',
      path: `/hospitals/${id}/status`,
      headers: { 'x-request-id': (req.headers['x-request-id'] as string) || '' },
    });
  }
}
