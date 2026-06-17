import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  check() {
    return {
      status: 'ok',
      service: 'vitalink-hms-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  ready() {
    const mongoStatus = this.connection.readyState;
    const isReady = mongoStatus === 1;

    return {
      status: isReady ? 'ready' : 'not_ready',
      service: 'vitalink-hms-api',
      mongo: {
        connected: isReady,
        readyState: mongoStatus,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
