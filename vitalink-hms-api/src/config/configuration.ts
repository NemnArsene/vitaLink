import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  name: process.env.APP_NAME || 'vitalink-hms-api',

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGODB_DB_NAME || 'vitalink_hms_db',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'hms-jwt-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '3600s',
  },

  gateway: {
    url: process.env.GATEWAY_URL || 'http://localhost:3000',
    jwtSecret: process.env.GATEWAY_JWT_SECRET || 'shared-jwt-secret',
  },

  swagger: {
    enabled: process.env.SWAGGER_ENABLED === 'true',
  },
}));
