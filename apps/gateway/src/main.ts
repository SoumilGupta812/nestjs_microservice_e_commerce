import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  process.title = 'gateway';
  const logger = new Logger('GatewayBootstrap');
  const app = await NestFactory.create(GatewayModule);

  app.enableShutdownHooks(); //enables the application to respond to shutdown signals
  // (like SIGINT and SIGTERM) and perform cleanup tasks before exiting.
  // This is useful for gracefully shutting down the application, closing database connections, and releasing resources.
  const port = Number(process.env.GATEWAY_PORT ?? 3000);
  await app.listen(port);
  logger.log(`Gateway listening on port ${port}`);
}
bootstrap();
