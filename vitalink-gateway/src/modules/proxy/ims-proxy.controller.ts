import { Controller, All, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ProxyService } from '../proxy/proxy.service';
import { Scopes } from '../../common/decorators/roles.decorator';
import { Scope } from '../../common/enums/roles.enum';

@ApiTags('IMS Proxy')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@Controller('ims')
export class ImsProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All('*')
  @Scopes(Scope.INSURANCE, Scope.ADMIN)
  @ApiOperation({ summary: 'Proxy all requests to IMS API' })
  async proxy(@Req() req: Request, @Res() res: Response) {
    const path = req.path.replace('/ims', '') || '/';
    const method = req.method as any;
    const originalUser = (req as any).user;

    const result = await this.proxyService.forwardRequest('ims', {
      method,
      path,
      body: req.body,
      params: req.query as Record<string, string>,
      headers: {
        'x-request-id': (req.headers['x-request-id'] as string) || '',
      },
      originalUser,
    });

    res.status(result.statusCode).json(result.data);
  }
}
