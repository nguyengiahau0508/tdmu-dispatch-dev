// src/config/factories/graphql.config.ts
import { registerAs } from '@nestjs/config';
import { IGraphQLConfig } from '../interfaces';
import { join } from 'path';

export default registerAs(
  'graphql',
  (): IGraphQLConfig => ({
    playgroundEnabled: process.env.GRAPHQL_PLAYGROUND_ENABLED === 'true',
    debugEnabled: process.env.GRAPHQL_DEBUG_ENABLED === 'true',
    autoSchemaFile: process.env.GRAPHQL_AUTOSCHEMAFILE_PATH
      ? join(process.cwd(), process.env.GRAPHQL_AUTOSCHEMAFILE_PATH)
      : true, // Mặc định là true, tự tạo trong memory hoặc chỉ định đường dẫn
    sortSchema: process.env.GRAPHQL_SORT_SCHEMA === 'true',
    introspection: process.env.GRAPHQL_INTROSPECTION_ENABLED === 'true', // Nên là false ở production
  }),
);
