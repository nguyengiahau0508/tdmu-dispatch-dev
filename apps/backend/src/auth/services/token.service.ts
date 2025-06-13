
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Role } from "src/common/enums/role.enums";
import { generateUniqueKey } from "src/common/utils/key-generator.util";
import { IJwtConfig } from "src/config/interfaces";
import { CacheKeyBuilder } from "src/integrations/cache/cache-key.builder";
import { CacheService } from "src/integrations/cache/cache.service";

export interface ITokenPayload {
  sub: number;
  email: string;
  type: 'access' | 'refresh' | 'onetime';
  role?: Role;
  tokenId: string;
}

@Injectable()
export class TokenService {
  private readonly ACCESS_TOKEN_TTL_SECONDS = 900;
  private readonly REFRESH_TOKEN_TTL_SECONDS = 604800;
  private readonly ONE_TIME_TOKEN_TTL_SECONS = 300
  private readonly jwtConfig: IJwtConfig;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService
  ) {
    const config = configService.get<IJwtConfig>('jwt');
    if (!config) {
      throw new InternalServerErrorException('JWT config not found');
    }
    this.jwtConfig = config;
  }

  /**
   * Generates an access token and stores it in cache for validation/revocation.
   */
  async generateAccessToken(payload: { sub: number; email: string; role: Role }): Promise<string> {
    const tokenId = generateUniqueKey();
    const tokenPayload: ITokenPayload = { ...payload, type: 'access', tokenId };

    const token = await this.jwtService.signAsync(tokenPayload, {
      secret: this.jwtConfig.secret,
      expiresIn: this.jwtConfig.accessTokenExpiresIn,
    });

    const key = CacheKeyBuilder.token(tokenId);
    await this.cacheService.set(key, true, this.ACCESS_TOKEN_TTL_SECONDS);

    return token;
  }


  /**
   * Generates a one-time token (revocable via cache).
   */
  async generateAccessOneTimeToken(payload: { sub: number; email: string }): Promise<string> {
    const tokenId = generateUniqueKey();
    const tokenPayload: ITokenPayload = { ...payload, type: 'onetime', tokenId };

    const token = await this.jwtService.signAsync(tokenPayload, {
      secret: this.jwtConfig.secret,
      expiresIn: this.ONE_TIME_TOKEN_TTL_SECONS, // Hoặc bạn có thể đặt 300s (5 phút) cho onetime
    });

    const key = CacheKeyBuilder.token(tokenId);
    await this.cacheService.set(key, true, this.ONE_TIME_TOKEN_TTL_SECONS);

    return token;
  }

  /**
   * Generates a refresh token and stores it in cache for validation/revocation.
   */
  async generateRefreshToken(payload: { sub: number; email: string }): Promise<string> {
    const tokenId = generateUniqueKey();
    const tokenPayload: ITokenPayload = { ...payload, type: 'refresh', tokenId };

    const token = await this.jwtService.signAsync(tokenPayload, {
      secret: this.jwtConfig.secret,
      expiresIn: this.jwtConfig.refreshTokenExpiresIn,
    });

    const key = CacheKeyBuilder.token(tokenId);
    await this.cacheService.set(key, true, this.REFRESH_TOKEN_TTL_SECONDS);

    return token;
  }

  /**
   * Revokes a token by removing it from the cache.
   */
  async revokeToken(tokenId: string): Promise<void> {
    const key = CacheKeyBuilder.token(tokenId);
    await this.cacheService.del(key);
  }

  /**
   * Checks if a token is valid (not revoked).
   */
  async isTokenValid(tokenId: string): Promise<boolean> {
    const key = CacheKeyBuilder.token(tokenId);
    const exists = await this.cacheService.get(key);
    return !!exists;
  }
}

