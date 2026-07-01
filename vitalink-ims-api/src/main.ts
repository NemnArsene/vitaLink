import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  const configService = app.get<ConfigService>(ConfigService);
  const port = parseInt(configService.get('PORT', '3002'), 10);
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');

  // Security middleware
  app.use(helmet());

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

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
      .setTitle('VitaLink IMS API')
      .setDescription(
        'Insurance Management System API - VitaLink Platform\n\n' +
          'Manages insurance operations including policies, claims processing, eligibility provision, and gateway integration.',
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
      .addTag('Auth IMS', 'IMS Authentication & Authorization')
      .addTag('Messaging IMS', 'Internal Insurance Chat & Messaging')
      .addTag('Policies', 'Insurance Policies Management')
      .addTag('Claims Processing', 'Claims Review & Approval')
      .addTag('Eligibility Provider', 'Insurance Coverage Verification')
      .addTag('Webhooks', 'Gateway Webhook Endpoints')
      .addServer('http://localhost:3002', 'Local Development')
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
  console.log(`🏢 VitaLink IMS API running on port ${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
