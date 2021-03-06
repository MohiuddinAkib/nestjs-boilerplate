import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import * as rateLimit from 'express-rate-limit';
import { AllExceptionsFilter } from '@lib/filters';
import { AppConfigService } from './config/app/app-config.service';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app
    .use(helmet())
    .use(compression())
    .use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
      }),
    )
    .useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        exceptionFactory: (errors) => {
          const formatted = errors.reduce((acc, curr) => {
            const fieldName = curr.property;
            const fieldErrors = Object.values(curr.constraints);
            acc[fieldName] = fieldErrors;
            return acc;
          }, {});

          return new BadRequestException({ message: formatted });
        },
      }),
    )
    .useGlobalFilters(new AllExceptionsFilter())
    .setGlobalPrefix('api/v1')
    .enableCors({ origin: '*' } as CorsOptions);

  // Get config service instance
  const appConfig: AppConfigService = app.get('AppConfigService');

  await app.listen(appConfig.port);
}

bootstrap();
