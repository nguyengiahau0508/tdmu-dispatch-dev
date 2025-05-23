import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthResolver } from './auth/auth.resolver';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './core/app-config';

@Module({
  imports: [
    AppConfigModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthResolver],
})
export class AppModule { }
