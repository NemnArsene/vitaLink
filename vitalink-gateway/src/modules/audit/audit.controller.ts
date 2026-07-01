import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuditService } from './audit.service';
import { Scopes } from '../../common/decorators/roles.decorator';
import { Scope } from '../../common/enums/roles.enum';

@ApiTags('Audit')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Scopes(Scope.ADMIN, Scope.AUDITOR)
  @ApiOperation({ summary: 'Get recent audit logs' })
  getRecent() {
    return this.auditService.getRecent();
  }

  @Get('search')
  @Scopes(Scope.ADMIN, Scope.AUDITOR)
  @ApiOperation({ summary: 'Search audit logs' })
  @ApiQuery({ name: 'entity', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'actorId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  search(
    @Query('entity') entity?: string,
    @Query('action') action?: string,
    @Query('actorId') actorId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.search({
      entity, action, actorId, status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('entity/:entity/:entityId')
  @Scopes(Scope.ADMIN, Scope.AUDITOR)
  @ApiOperation({ summary: 'Get audit trail for a specific entity' })
  findByEntity(@Param('entity') entity: string, @Param('entityId') entityId: string) {
    return this.auditService.findByEntity(entity, entityId);
  }

  @Get('actor/:actorId')
  @Scopes(Scope.ADMIN, Scope.AUDITOR)
  @ApiOperation({ summary: 'Get audit logs by actor' })
  findByActor(@Param('actorId') actorId: string) {
    return this.auditService.findByActor(actorId);
  }

  @Get('stats')
  @Scopes(Scope.ADMIN, Scope.AUDITOR)
  @ApiOperation({ summary: 'Get audit statistics by action type' })
  getStats() {
    return this.auditService.countByAction();
  }
}
