import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class PilotageService {
  private readonly logger = new Logger(PilotageService.name);
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

  private generateServiceToken(): string {
    return jwt.sign(
      {
        sub: 'gateway-admin',
        email: 'admin@vitalink.com',
        role: 'gateway_admin',
        scope: 'scope:admin',
        permissions: ['*'],
      },
      this.jwtSecret,
      { expiresIn: '5m' },
    );
  }

  private getHeaders() {
    const token = this.generateServiceToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Gateway-Forward': 'true',
    };
  }

  async getAggregatedDashboard(): Promise<any> {
    try {
      const [hmsHealth, imsHealth] = await Promise.allSettled([
        firstValueFrom(this.httpService.get(`${this.hmsApiUrl}/health`, { headers: this.getHeaders() })),
        firstValueFrom(this.httpService.get(`${this.imsApiUrl}/health`, { headers: this.getHeaders() })),
      ]);

      const [hmsDashboard, imsDashboard] = await Promise.allSettled([
        firstValueFrom(this.httpService.get(`${this.hmsApiUrl}/dashboard`, { headers: this.getHeaders() })),
        firstValueFrom(this.httpService.get(`${this.imsApiUrl}/reports/dashboard`, { headers: this.getHeaders() })),
      ]);

      return {
        timestamp: new Date().toISOString(),
        services: {
          hms: {
            status: hmsHealth.status === 'fulfilled' ? 'operational' : 'down',
            url: this.hmsApiUrl,
            dashboard: hmsDashboard.status === 'fulfilled' ? hmsDashboard.value.data : null,
          },
          ims: {
            status: imsHealth.status === 'fulfilled' ? 'operational' : 'down',
            url: this.imsApiUrl,
            dashboard: imsDashboard.status === 'fulfilled' ? imsDashboard.value.data : null,
          },
          gateway: {
            status: 'operational',
            url: this.configService.get('PORT', '3000'),
          },
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to fetch aggregated dashboard: ${error.message}`);
      throw error;
    }
  }

  async getHealthStatus(): Promise<any> {
    const [hms, ims] = await Promise.allSettled([
      firstValueFrom(this.httpService.get(`${this.hmsApiUrl}/health`, { headers: this.getHeaders() })),
      firstValueFrom(this.httpService.get(`${this.imsApiUrl}/health`, { headers: this.getHeaders() })),
    ]);

    return {
      gateway: { status: 'up', timestamp: new Date().toISOString() },
      hms: { status: hms.status === 'fulfilled' ? 'up' : 'down' },
      ims: { status: ims.status === 'fulfilled' ? 'up' : 'down' },
    };
  }

  async getCrossPlatformStats(): Promise<any> {
    try {
      const [hmsStats, imsStats] = await Promise.allSettled([
        firstValueFrom(this.httpService.get(`${this.hmsApiUrl}/dashboard/patient-stats`, { headers: this.getHeaders() })),
        firstValueFrom(this.httpService.get(`${this.imsApiUrl}/reports/dashboard`, { headers: this.getHeaders() })),
      ]);

      return {
        hms: hmsStats.status === 'fulfilled' ? hmsStats.value.data : { error: 'HMS unavailable' },
        ims: imsStats.status === 'fulfilled' ? imsStats.value.data : { error: 'IMS unavailable' },
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error(`Cross-platform stats fetch failed: ${error.message}`);
      return { error: 'Failed to fetch cross-platform stats' };
    }
  }
}
