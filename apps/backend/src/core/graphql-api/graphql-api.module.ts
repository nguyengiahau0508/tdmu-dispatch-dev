// src/core/graphql-api/graphql-api.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { IGraphQLConfig } from '../../config/interfaces';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule], // Đảm bảo ConfigModule có sẵn
      useFactory: (configService: ConfigService) => {
        const gqlConfig = configService.get<IGraphQLConfig>('graphql');
        return {
          playground: gqlConfig?.playgroundEnabled,
          debug: gqlConfig?.debugEnabled,
          autoSchemaFile: gqlConfig?.autoSchemaFile,
          sortSchema: gqlConfig?.sortSchema,
          introspection: gqlConfig?.introspection,
          // context: ({ req, res }) => ({ req, res }), // Nếu cần
          // ... các tùy chọn khác nếu có
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class GraphqlApiModule { }
