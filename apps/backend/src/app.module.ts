import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthResolver } from './auth/auth.resolver';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './core/app-config';
import { DatabaseModule } from './core/database/database.module';
import { GraphqlApiModule } from './core/graphql-api';
import { UsersModule } from './modules/user/user.module';

@Module({
  imports: [
    AppConfigModule,
    AuthModule,
    DatabaseModule,
    GraphqlApiModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService, AuthResolver],
})
export class AppModule { }
