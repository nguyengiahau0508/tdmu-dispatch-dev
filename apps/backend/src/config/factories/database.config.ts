// src/config/database.config.ts
import { registerAs } from '@nestjs/config';
import { IDatabaseConfig } from '../interfaces';
import { join } from 'node:path/win32';

export default registerAs(
  'database',
  (): IDatabaseConfig => ({
    type: process.env.DATABASE_TYPE || 'mariadb',
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 3306, // Port mặc định của MariaDB/MySQL
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME || 'mydatabase',
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true', // true trong dev
    logging: process.env.DATABASE_LOGGING
      ? (process.env.DATABASE_LOGGING.split(',') as IDatabaseConfig['logging'])
      : false, // Ví dụ: "query,error"
    entities: [
      process.env.DATABASE_ENTITIES ||
        join(__dirname, '/../../../**/*.entity{.ts,.js}'),
    ], // Điều chỉnh đường dẫn nếu cần
    migrations: [
      process.env.DATABASE_MIGRATIONS ||
        join(__dirname, '/../../../database/migrations/*{.ts,.js}'),
    ],
    migrationsRun: process.env.DATABASE_MIGRATIONS_RUN === 'true',
    timezone: process.env.DATABASE_TIMEZONE || 'Z', // UTC
    charset: process.env.DATABASE_CHARSET || 'utf8mb4_unicode_ci',
    url: process.env.DATABASE_URL, // Có thể dùng DATABASE_URL thay cho các trường riêng lẻ
  }),
);
