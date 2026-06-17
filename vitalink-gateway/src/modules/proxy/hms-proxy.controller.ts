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
    const path = req.path === '/' ? '' : req.path;
    const method = req.method as any;

    const result = await this.proxyService.forwardRequest('hms', {
      method,
      path,
      body: req.body,
      params: req.query as Record<string, string>,
      headers: {
        'x-request-id': (req.headers['x-request-id'] as string) || '',
      },
    });

    res.json(result);
  }
}
