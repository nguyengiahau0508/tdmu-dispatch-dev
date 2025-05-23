// src/config/graphql.config.ts
import { registerAs } from '@nestjs/config';
import { join } from 'path';
import { IGraphQLConfig } from '../interfaces';

export default registerAs(
  'graphql',
  (): IGraphQLConfig => ({
    playgroundEnabled: process.env.GRAPHQL_PLAYGROUND === 'true', // true trong dev
    debugEnabled: process.env.GRAPHQL_DEBUG === 'true', // true trong dev
    schemaDestination:
      process.env.GRAPHQL_SCHEMA_DEST || join(process.cwd(), 'src/schema.gql'),
    sortSchema: process.env.GRAPHQL_SORT_SCHEMA === 'true',
  }),
);
