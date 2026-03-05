import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { static as serveStatic } from 'express';
import { resolve } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ApplicationExceptionFilter } from './shared/interface/http/filters/application-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api/v1');

  const allowedOrigins = new Set(
    (process.env.FRONTEND_URLS ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
  allowedOrigins.add(process.env.FRONTEND_URL ?? 'http://localhost:4200');
  allowedOrigins.add('http://localhost:4000');

  app.use(helmet());
  app.enableCors({
    origin: Array.from(allowedOrigins),
    credentials: true,
  });

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

  app.useGlobalFilters(new ApplicationExceptionFilter());

  const uploadsRoutePrefix = process.env.LOCAL_UPLOADS_ROUTE_PREFIX ?? 'uploads';
  const uploadsDir = resolve(process.cwd(), process.env.LOCAL_UPLOADS_DIR ?? 'uploads');
  app.use(`/${uploadsRoutePrefix}`, serveStatic(uploadsDir));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MiDespacho API')
    .setDescription('API para administracion de expedientes y archivos')
    .setVersion('1.0.0')
    .addCookieAuth(process.env.COOKIE_NAME ?? 'md_auth')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
