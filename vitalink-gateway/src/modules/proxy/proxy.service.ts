import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';

import { JwtPayload } from '../../common/decorators/current-user.decorator';

export interface ProxyOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: any;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  scope?: string;
  originalUser?: JwtPayload;
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly hmsApiUrl: string;
  private readonly imsApiUrl: string;
  private readonly jwtSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.hmsApiUrl = this.configService.get('app.hmsApiUrl', 'http://localhost:3001');
    this.imsApiUrl = this.configService.get('app.imsApiUrl', 'http://localhost:3002');
    this.jwtSecret = this.configService.get('app.serviceJwtSecret', 'shared-jwt-secret');
  }

  private generateServiceToken(scope: string, originalUser?: JwtPayload): string {
    const isHospital = scope === 'scope:hospital';
    const payload: any = originalUser
      ? {
          sub: originalUser.sub,
          email: originalUser.email,
          role: originalUser.role,
          scope,
          entityId: originalUser.entityId,
          entityType: originalUser.entityType,
          permissions: originalUser.permissions || [],
          originalSub: originalUser.sub,
          originalEmail: originalUser.email,
          originalRole: originalUser.role,
        }
      : {
          sub: isHospital ? 'hms-service' : 'ims-service',
          email: isHospital ? 'hms@vitalink.com' : 'ims@vitalink.com',
          role: 'service',
          scope,
          entityId: isHospital ? 'hms-001' : 'ims-001',
          entityType: isHospital ? 'hospital' : 'insurance',
          permissions: isHospital
            ? ['patients:read', 'patients:write', 'billing:read', 'billing:write', 'eligibility:read']
            : ['policies:read', 'policies:write', 'claims:read', 'claims:write'],
        };

    return jwt.sign(payload, this.jwtSecret, { expiresIn: '1h' });
  }

  private getBaseUrl(target: 'hms' | 'ims'): string {
    return target === 'hms' ? this.hmsApiUrl : this.imsApiUrl;
  }

  async forwardRequest(target: 'hms' | 'ims', options: ProxyOptions): Promise<any> {
    const baseUrl = this.getBaseUrl(target);
    const scope = options.scope || (target === 'hms' ? 'scope:hospital' : 'scope:insurance');
    const token = this.generateServiceToken(scope, options.originalUser);

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Gateway-Forward': 'true',
      ...options.headers,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method: options.method,
          url: `${baseUrl}${options.path}`,
          data: options.body,
          params: options.params,
          headers,
          validateStatus: () => true,
        }),
      );

      if (response.status >= 400) {
        this.logger.warn(
          `Proxy ${options.method} ${target}${options.path} returned ${response.status}`,
        );
      }

      return {
        statusCode: response.status,
        data: response.data,
      };
    } catch (error: any) {
      this.logger.error(
        `Proxy ${options.method} ${target}${options.path} failed: ${error.message}`,
      );
      return {
        statusCode: 502,
        data: { success: false, message: `Downstream service unreachable: ${error.message}` },
      };
    }
  }

  // Convenience methods (return only data, for backward compat)
  async getHms(path: string, params?: Record<string, string>) {
    const r = await this.forwardRequest('hms', { method: 'GET', path, params, scope: 'scope:hospital' });
    return r.data;
  }

  async postHms(path: string, body?: any) {
    const r = await this.forwardRequest('hms', { method: 'POST', path, body, scope: 'scope:hospital' });
    return r.data;
  }

  async putHms(path: string, body?: any) {
    const r = await this.forwardRequest('hms', { method: 'PUT', path, body, scope: 'scope:hospital' });
    return r.data;
  }

  async deleteHms(path: string) {
    const r = await this.forwardRequest('hms', { method: 'DELETE', path, scope: 'scope:hospital' });
    return r.data;
  }

  async getIms(path: string, params?: Record<string, string>) {
    const r = await this.forwardRequest('ims', { method: 'GET', path, params, scope: 'scope:insurance' });
    return r.data;
  }

  async postIms(path: string, body?: any) {
    const r = await this.forwardRequest('ims', { method: 'POST', path, body, scope: 'scope:insurance' });
    return r.data;
  }

  async putIms(path: string, body?: any) {
    const r = await this.forwardRequest('ims', { method: 'PUT', path, body, scope: 'scope:insurance' });
    return r.data;
  }

  async deleteIms(path: string) {
    const r = await this.forwardRequest('ims', { method: 'DELETE', path, scope: 'scope:insurance' });
    return r.data;
  }
}
