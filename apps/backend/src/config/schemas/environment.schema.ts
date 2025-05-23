import * as Joi from 'joi';

export const enviromentSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  APP_NAME: Joi.string().default('TDMU Dispatch Backend'),
  APP_PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('/api/v1'),
  CLIENT_URL: Joi.string().uri().default('http://localhost:4200'),
  CORS_ORIGIN: Joi.string().default('*'),

  // Database
  DATABASE_TYPE: Joi.string().default('mariadb'),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(3306),
  DATABASE_USER: Joi.string().when('DATABASE_TYPE', {
    is: 'mongodb',
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  DATABASE_PASSWORD: Joi.string().when('DATABASE_TYPE', {
    is: 'mongodb',
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_LOGGING: Joi.boolean().default(false),
  DATABASE_URL: Joi.string().uri().optional(),

  // JWT
  JWT_SECRET_KEY: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_TOKEN_SECRET_KEY: Joi.string().required(),
  JWT_REFRESH_TOKEN_EXPIRATION: Joi.string().default('7d'),

  // GraphQL (nếu có)
  GRAPHQL_PLAYGROUND: Joi.boolean().default(
    process.env.NODE_ENV !== 'production',
  ),
  GRAPHQL_DEBUG: Joi.boolean().default(
    process.env.NODE_ENV !== 'production',
  ),
  GRAPHQL_SCHEMA_DEST: Joi.string().default('./src/schema.gql'),
  GRAPHQL_SORT_SCHEMA: Joi.boolean().default(false),
});
