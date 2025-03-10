import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { responseCreator } from './utils/helper.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const groupedErrors: Record<string, string[]> = {};

        errors.forEach((error) => {
          if (error.constraints) {
            Object.entries(error.constraints).forEach(
              ([constraintName, message]) => {
                if (!groupedErrors[error.property]) {
                  groupedErrors[error.property] = [];
                }
                groupedErrors[error.property].push(message);
              },
            );
          }
        });
        const result = responseCreator(
          400,
          'Validation Error',
          null,
          groupedErrors,
        );
        return new BadRequestException(result);
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
