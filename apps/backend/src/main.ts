import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Middleware
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.enableCors({
    origin: true,
    credentials: true,
  })
  //app.useGlobalFilters(new AllExceptionsFilter())
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
