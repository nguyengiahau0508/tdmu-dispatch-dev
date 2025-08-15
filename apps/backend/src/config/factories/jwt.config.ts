// src/config/jwt.config.ts
import { registerAs } from '@nestjs/config';
import { IJwtConfig } from '../interfaces';

export default registerAs(
  'jwt',
  (): IJwtConfig => ({
    secret: process.env.JWT_SECRET_KEY || 'your-default-secret-key',
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '15m',
    refreshTokenSecret:
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY ||
      'your-default-refresh-secret-key',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d',
  }),
);
