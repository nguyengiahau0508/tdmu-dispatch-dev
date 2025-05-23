// src/config/database.config.ts
import { registerAs } from '@nestjs/config';
import { IDatabaseConfig } from '../interfaces';

export default registerAs(
  'database',
  (): IDatabaseConfig => ({
    type: process.env.DATABASE_TYPE || 'mariadb',
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 3306,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME || 'mydatabase',
    synchronize: process.env.NODE_ENV === 'development', // true trong dev, false trong prod
    logging: process.env.DATABASE_LOGGING === 'true',
    url: process.env.DATABASE_URL, // Có thể dùng DATABASE_URL thay cho các trường riêng lẻ
  }),
);
