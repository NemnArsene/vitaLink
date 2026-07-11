import { Controller, Post, Get, Put, Body, Param, Req, Res, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProxyService } from '../proxy/proxy.service';
import { Scopes } from '../../common/decorators/roles.decorator';
import { Scope } from '../../common/enums/roles.enum';
import { Request, Response } from 'express';
import { EligibilityCheckDto } from './dto/eligibility-check.dto';
import { SubmitClaimDto } from './dto/submit-claim.dto';
import { ClaimDecisionDto } from './dto/claim-decision.dto';
import { ApproveClaimDto } from './dto/approve-claim.dto';
import { RejectClaimDto } from './dto/reject-claim.dto';
import { DisputeClaimDto } from './dto/dispute-claim.dto';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

@ApiTags('API Gateway')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller()
export class ApiController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post('eligibility/check')
  @Scopes(Scope.HOSPITAL, Scope.ADMIN)
  @ApiOperation({ summary: 'Check insurance eligibility (proxied to IMS) — English alias' })
  async checkEligibilityEn(@Req() req: Request, @Res() res: Response, @Body() dto: EligibilityCheckDto) {
    const result = await this.proxyService.forwardRequest('ims', {
      method: 'POST',
      path: '/api/v1/eligibility/check',
      body: dto,
      headers: { 'x-request-id': (req.headers['x-request-id'] as string) || '' },
    });
    res.status(result.statusCode).json(result.data);
  }

  @Post('eligibilite/check')
  @Scopes(Scope.HOSPITAL, Scope.ADMIN)
  @ApiOperation({ summary: 'Check insurance eligibility (proxied to IMS)' })
  async checkEligibility(@Req() req: Request, @Res() res: Response, @Body() dto: EligibilityCheckDto) {
    const result = await this.proxyService.forwardRequest('ims', {
      method: 'POST',
      path: '/api/v1/eligibility/check',
      body: dto,
      headers: { 'x-request-id': (req.headers['x-request-id'] as string) || '' },
    });
    res.status(result.statusCode).json(result.data);
  }

  @Post('claims')
  @Scopes(Scope.HOSPITAL, Scope.ADMIN)
  @ApiOperation({ summary: 'Submit claim (proxied to IMS) — English alias' })
  async submitClaimEn(@Req() req: Request, @Res() res: Response, @Body() dto: SubmitClaimDto) {
    const result = await this.proxyService.forwardRequest('ims', {
      method: 'POST',
      path: '/api/v1/claims-processing',
      body: dto,
      headers: { 'x-request-id': (req.headers['x-request-id'] as string) || '' },
    });
    await this.afterClaimSubmitted(req, dto, result.data);
    res.status(result.statusCode).json(result.data);
  }

  @Post('remboursement/soumettre')
  @Scopes(Scope.HOSPITAL, Scope.ADMIN)
  @ApiOperation({ summary: 'Submit reimbursement claim (proxied to IMS)' })
  async submitClaim(@Req() req: Request, @Res() res: Response, @Body() dto: SubmitClaimDto) {
    const result = await this.proxyService.forwardRequest('ims', {
      method: 'POST',
      path: '/api/v1/claims-processing',
      body: dto,
      headers: { 'x-request-id': (req.headers['x-request-id'] as string) || '' },
    });
    await this.afterClaimSubmitted(req, dto, result.data);
    res.status(result.statusCode).json(result.data);
  }

  @Post('claims/:claimId/decision')
  @Scopes(Scope.INSURANCE, Scope.ADMIN)
  @ApiOperation({ summary: 'Receive claim decision and forward as webhook to HMS' })
  async claimDecision(@Req() req: Request, @Res() res: Response, @Param('claimId') claimId: string, @Body() dto: ClaimDecisionDto) {
    const eventType = dto.decision === 'approved' ? 'CLAIM_APPROVED'
                    : dto.decision === 'paid' ? 'CLAIM_PROCESSED'
                    : dto.decision === 'disputed' ? 'CLAIM_DISPUTED'
                    : 'CLAIM_REJECTED';
    const result = await this.proxyService.forwardRequest('hms', {
      method: 'POST',
      path: '/api/v1/webhooks/gateway',
      body: {
        eventType,
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
    this.notificationsService.emit({
      type: `claim.${dto.decision}`,
      entityType: 'claim',
      data: {
        claimId,
        claimNumber: dto.claimNumber,
        decision: dto.decision,
        hospitalId: dto.hospitalId,
        montantApprouve: dto.montantApprouve,
        rejectionReason: dto.rejectionReason,
      },
    });
    await this.auditService.log({
      action: `claim.${dto.decision}`,
      entity: 'claim',
      entityId: claimId,
      actorId: ((req as any).user?.sub as string) || 'ims-service',
      actorName: ((req as any).user?.email as string) || 'IMS Service',
      actorRole: ((req as any).user?.role as string) || 'service',
      actorEntityType: 'insurance',
      newState: {
        decision: dto.decision,
        claimNumber: dto.claimNumber,
        montantApprouve: dto.montantApprouve,
        rejectionReason: dto.rejectionReason,
      },
      changes: ['decision'],
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      requestId: (req.headers['x-request-id'] as string) || '',
      metadata: {
        forwardedTo: 'hms',
        webhookEvent: eventType,
        hospitalId: dto.hospitalId,
        downstreamStatusCode: result.statusCode,
      },
    });
    res.status(result.statusCode).json(result.data);
  }

  private async afterClaimSubmitted(req: Request, dto: SubmitClaimDto, responseData: any): Promise<void> {
    const payload = responseData?.data ?? responseData;
    const claimId = payload?._id ?? payload?.claimId ?? payload?.id ?? dto.invoiceId;
    const claimNumber = payload?.claimNumber;

    this.notificationsService.emit({
      type: 'claim.new',
      entityType: 'claim',
      data: {
        claimId,
        claimNumber,
        invoiceId: dto.invoiceId,
        invoiceNumber: dto.invoiceNumber,
        patientName: dto.patientName,
        hospitalId: dto.hospitalId,
        montantTotal: dto.montantTotal,
      },
    });

    await this.auditService.log({
      action: 'claim.submitted',
      entity: 'claim',
      entityId: claimId,
      actorId: ((req as any).user?.sub as string) || 'hms-service',
      actorName: ((req as any).user?.email as string) || 'HMS Service',
      actorRole: ((req as any).user?.role as string) || 'service',
      actorEntityType: 'hospital',
      newState: {
        claimId,
        claimNumber,
        invoiceId: dto.invoiceId,
        invoiceNumber: dto.invoiceNumber,
        statut: payload?.statut ?? payload?.status,
      },
      changes: ['submitted'],
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      requestId: (req.headers['x-request-id'] as string) || '',
      metadata: {
        forwardedTo: 'ims',
        hospitalId: dto.hospitalId,
        montantTotal: dto.montantTotal,
      },
    });
  }

  @Get('remboursement/:id')
  @Scopes(Scope.HOSPITAL, Scope.INSURANCE, Scope.ADMIN)
  @ApiOperation({ summary: 'Get claim details (proxied to IMS)' })
  async getClaim(@Req() req: Request, @Res() res: Response, @Param('id') id: string) {
    const result = await this.proxyService.forwardRequest('ims', {
      method: 'GET',
      path: `/api/v1/claims-processing/${id}`,
      headers: { 'x-request-id': (req.headers['x-request-id'] as string) || '' },
    });
    res.status(result.statusCode).json(result.data);
  }

  @Put('remboursement/:id/approuver')
  @Scopes(Scope.INSURANCE, Scope.ADMIN)
  @ApiOperation({ summary: 'Approve a claim (proxied to IMS)' })
  async approveClaim(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Body() dto: ApproveClaimDto) {
    const result = await this.proxyService.forwardRequest('ims', {
      method: 'POST',
      path: `/api/v1/claims-processing/${id}/approve`,
      body: dto,
      headers: { 'x-request-id': (req.headers['x-request-id'] as string) || '' },
    });
    res.status(result.statusCode).json(result.data);
  }

  @Put('remboursement/:id/rejeter')
  @Scopes(Scope.INSURANCE, Scope.ADMIN)
  @ApiOperation({ summary: 'Reject a claim (proxied to IMS)' })
  async rejectClaim(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Body() dto: RejectClaimDto) {
    const result = await this.proxyService.forwardRequest('ims', {
      method: 'POST',
      path: `/api/v1/claims-processing/${id}/reject`,
      body: dto,
      headers: { 'x-request-id': (req.headers['x-request-id'] as string) || '' },
    });
    res.status(result.statusCode).json(result.data);
  }

  @Put('claims-processing/:id/dispute')
  @Scopes(Scope.HOSPITAL, Scope.INSURANCE, Scope.ADMIN)
  @ApiOperation({ summary: 'Flag a claim as disputed (proxied to IMS) — English alias' })
  async disputeClaimEn(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Body() dto: DisputeClaimDto) {
    const result = await this.proxyService.forwardRequest('ims', {
      method: 'PUT',
      path: `/api/v1/claims-processing/${id}/dispute`,
      body: dto,
      headers: { 'x-request-id': (req.headers['x-request-id'] as string) || '' },
    });
    res.status(result.statusCode).json(result.data);
  }

  @Put('remboursement/:id/litige')
  @Scopes(Scope.HOSPITAL, Scope.INSURANCE, Scope.ADMIN)
  @ApiOperation({ summary: 'Flag a claim as disputed (proxied to IMS)' })
  async disputeClaim(@Req() req: Request, @Res() res: Response, @Param('id') id: string, @Body() dto: DisputeClaimDto) {
    const result = await this.proxyService.forwardRequest('ims', {
      method: 'PUT',
      path: `/api/v1/claims-processing/${id}/dispute`,
      body: dto,
      headers: { 'x-request-id': (req.headers['x-request-id'] as string) || '' },
    });
    res.status(result.statusCode).json(result.data);
  }

  @Get('hopitaux/:id/statut')
  @Scopes(Scope.INSURANCE, Scope.ADMIN)
  @ApiOperation({ summary: 'Check hospital network status (proxied to HMS)' })
  async getHospitalStatus(@Req() req: Request, @Res() res: Response, @Param('id') id: string) {
    const result = await this.proxyService.forwardRequest('hms', {
      method: 'GET',
      path: `/api/v1/hospitals/${id}/status`,
      headers: { 'x-request-id': (req.headers['x-request-id'] as string) || '' },
    });
    res.status(result.statusCode).json(result.data);
  }
}
