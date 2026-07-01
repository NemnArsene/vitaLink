import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  name: process.env.APP_NAME || 'vitalink-gateway',

  // Downstream API URLs (Gateway is stateless — no DB)
  hmsApiUrl: process.env.HMS_API_URL || 'http://localhost:3001',
  imsApiUrl: process.env.IMS_API_URL || 'http://localhost:3002',

  // Shared JWT secret for inter-service auth
  serviceJwtSecret: process.env.SERVICE_JWT_SECRET || 'shared-jwt-secret',
}));
