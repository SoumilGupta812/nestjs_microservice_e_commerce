import { INestMicroservice, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './rpc-exception.filter';
export function applyToMicroservice(app: INestMicroservice) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
}
