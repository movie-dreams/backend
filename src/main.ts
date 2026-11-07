import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { ValidationError } from 'class-validator';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { AppModule } from './app.module.js';

async function bootstrap() {
  initializeTransactionalContext();

  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  const cors = configService.get<string>('app.cors') === "*" ? true : configService.get<string>('app.cors')?.split(',');

  app.enableCors({
    origin: cors,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const collectMessages = (
          validationErrors: ValidationError[],
        ): string[] =>
          validationErrors.flatMap((error) => {
            const constraintMessages = Object.entries(
              error.constraints ?? {},
            ).map(([constraint, message]) =>
              constraint === 'whitelistValidation'
                ? `El campo '${error.property}' no es un dato admitido.`
                : message,
            );
            return [
              ...constraintMessages,
              ...collectMessages(error.children ?? []),
            ];
          });

        return new BadRequestException(collectMessages(errors));
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Cinema API')
    .setDescription('API del sistema de cine')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('documentacion', app, document);

  const port = configService.get<number>('app.port') ?? 3000;
  await app.listen(port);
  logger.log(`La aplicación está corriendo en: ${await app.getUrl()}`);
}
bootstrap();