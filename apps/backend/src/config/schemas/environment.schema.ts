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

  // Database (MariaDB/MySQL)
  DATABASE_TYPE: Joi.string()
    .valid('mariadb', 'mysql', 'postgres')
    .default('mariadb'),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(3306),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(), // Để trống nếu không có pass cho local dev, nhưng nên có
  DATABASE_NAME: Joi.string().required(),
  DATABASE_SYNCHRONIZE: Joi.boolean().default(
    process.env.NODE_ENV === 'development',
  ),
  DATABASE_LOGGING: Joi.string()
    .custom((value, helpers) => {
      // Cho phép chuỗi rỗng, 'true', 'false', hoặc danh sách
      if (value === '' || value === undefined) return false;
      if (value === 'true') return true;
      if (value === 'false') return false;
      const validLevels = ['query', 'error', 'schema', 'warn', 'info', 'log'];
      const levels = value.split(',');
      if (levels.every((level) => validLevels.includes(level.trim()))) {
        return levels.map((l) => l.trim());
      }
      return helpers.error('any.invalid');
    })
    .default(false),
  DATABASE_ENTITIES: Joi.string().default('dist/**/*.entity.js'), // Trỏ đến file js sau khi build
  DATABASE_MIGRATIONS: Joi.string().default('dist/database/migrations/*.js'),
  DATABASE_MIGRATIONS_RUN: Joi.boolean().default(false),
  DATABASE_TIMEZONE: Joi.string().default('Z'),
  DATABASE_CHARSET: Joi.string().default('utf8mb4_unicode_ci'),
  DATABASE_URL: Joi.string().uri().optional(),

  // JWT
  JWT_SECRET_KEY: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_TOKEN_SECRET_KEY: Joi.string().required(),
  JWT_REFRESH_TOKEN_EXPIRATION: Joi.string().default('7d'),

  // GraphQL
  GRAPHQL_PLAYGROUND_ENABLED: Joi.boolean().default(
    process.env.NODE_ENV !== 'production',
  ),
  GRAPHQL_DEBUG_ENABLED: Joi.boolean().default(
    process.env.NODE_ENV !== 'production',
  ),
  GRAPHQL_AUTOSCHEMAFILE_PATH: Joi.string().default('src/schema.gql'), // Hoặc để trống nếu muốn true
  GRAPHQL_SORT_SCHEMA: Joi.boolean().default(false),
  GRAPHQL_INTROSPECTION_ENABLED: Joi.boolean().default(
    process.env.NODE_ENV !== 'production',
  ),
});
