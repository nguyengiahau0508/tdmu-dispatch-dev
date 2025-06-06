import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Middleware
  app.useGlobalPipes(new ValidationPipe())
  //app.useGlobalFilters(new AllExceptionsFilter())
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
