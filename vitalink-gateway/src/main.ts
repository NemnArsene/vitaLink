import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { initTracing } from './config/tracing.config';

async function bootstrap() {
  // Initialize OpenTelemetry tracing
  initTracing();

  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  const configService = app.get<ConfigService>(ConfigService);
  const port = parseInt(configService.get('PORT', '3000'), 10);
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');

  // Security middleware
  app.use(helmet());

  // Global prefix and versioning
  app.setGlobalPrefix(apiPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // CORS configuration
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  });

  // Swagger documentation
  if (configService.get('SWAGGER_ENABLED', 'true') === 'true') {
    const config = new DocumentBuilder()
      .setTitle('VitaLink API Gateway')
      .setDescription(
        'API Gateway Enterprise - Plateforme Intégrée Assurance-Hôpital\n\n' +
        'Central gateway connecting Hospital Platform and Insurance Platform.\n' +
        'Handles authentication, eligibility checks, claims management, notifications, and audit logging.',
      )
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
        'access-token',
      )
      .addTag('Auth', 'Authentication & Token Management')
      .addTag('Eligibility', 'Insurance Coverage Verification')
      .addTag('Claims', 'Reimbursement Claims Management')
      .addTag('Notifications', 'Notification Management')
      .addTag('Audit', 'Audit Trail & Compliance')
      .addTag('Health', 'Health Checks & Monitoring')
      .addServer('http://localhost:3000', 'Local Development')
      .addServer('https://api-gateway.vitalink.com', 'Production')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
    });
  }

  await app.listen(port);
  console.log(`🚀 VitaLink Gateway running on port ${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
