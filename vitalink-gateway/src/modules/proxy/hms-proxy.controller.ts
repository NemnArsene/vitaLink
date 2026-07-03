import { Controller, All, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ProxyService } from '../proxy/proxy.service';
import { Scopes } from '../../common/decorators/roles.decorator';
import { Scope } from '../../common/enums/roles.enum';

@ApiTags('HMS Proxy')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('hms')
export class HmsProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('*')
  @Scopes(Scope.HOSPITAL, Scope.ADMIN)
  @ApiOperation({ summary: 'Proxy all requests to HMS API' })
  async proxy(@Req() req: Request, @Res() res: Response) {
    // req.path includes the global prefix and controller prefix, e.g., /api/v1/hms/refunds
    // We need to strip the /hms part to forward as /api/v1/refunds
    const path = req.path.replace('/hms', '') || '/';
    const method = req.method as any;
    const originalUser = (req as any).user;

    const result = await this.proxyService.forwardRequest('hms', {
      method,
      path,
      body: req.body,
      params: req.query as Record<string, string>,
      headers: {
        'x-request-id': (req.headers['x-request-id'] as string) || '',
      },
      originalUser,
    });

    res.json(result);
  }
}
