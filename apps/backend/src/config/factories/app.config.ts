// src/config/app.config.ts
import { registerAs } from '@nestjs/config';
import { IAppConfig } from '../interfaces';

export default registerAs(
  'app',
  (): IAppConfig => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    name: process.env.APP_NAME || 'TDMU Dispatch Backend',
    port: Number(process.env.APP_PORT) || 3000,
    apiPrefix: process.env.API_PREFIX || '/api/v1',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:4200',
    corsOrigin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : true, // Mặc định cho phép tất cả, hoặc ['http://localhost:3001', 'https://yourdomain.com']
  }),
);
