import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './core/app-config';
import { DatabaseModule } from './core/database/database.module';
import { GraphqlApiModule } from './core/graphql-api';
import { FeaturesModule } from './modules/features.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GraphQLExceptionFilter } from './common/filters/graphql-exception.filter';
import { GqlAuthGuard } from './auth/guards/gql-auth.guard';

@Module({
  imports: [
    AppConfigModule,
    AuthModule,
    DatabaseModule,
    GraphqlApiModule,
    FeaturesModule
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_FILTER, useClass: GraphQLExceptionFilter
    },
    {
      provide: APP_GUARD, useClass: GqlAuthGuard
    }
  ],
})
export class AppModule { }
