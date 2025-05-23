// src/config/interfaces/jwt-config.interface.ts
export default interface IJwtConfig {
  secret: string;
  accessTokenExpiresIn: string; // ví dụ: '15m', '1h'
  refreshTokenSecret: string;
  refreshTokenExpiresIn: string; // ví dụ: '7d'
}
