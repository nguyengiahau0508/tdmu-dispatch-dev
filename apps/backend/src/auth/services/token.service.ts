import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Role } from "src/common/enums/role.enums";
import { IJwtConfig } from "src/config/interfaces";

// Defines the structure of JWT token payloads
export interface ITokenPayload {
  sub: number;
  email: string;
  type: 'access' | 'refresh' | 'onetime';
  role: Role
}

@Injectable()
export class TokenService {
  private readonly jwtConfig: IJwtConfig;
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // Load JWT configuration from environment or configuration file
    const config = configService.get<IJwtConfig>('jwt');
    if (!config) {
      // Throw an exception if the config is missing
      throw new InternalServerErrorException();
    }
    this.jwtConfig = config;
  }

  /**
     * Generates an access token with the given payload.
     * This token is short-lived and used for authentication.
     */
  async generateAccessToken(payload: { sub: number; email: string, role: Role }): Promise<string> {
    return this.jwtService.sign(
      { ...payload, type: 'access' }, // Add token type to payload
      {
        secret: this.jwtConfig.secret, // Secret key for access token
        expiresIn: this.jwtConfig.accessTokenExpiresIn, // Expiration time
      },
    );
  }

  async generateAccessOneTimeToken(payload: { sub: number, email: string }): Promise<string> {
    return this.jwtService.sign(
      { ...payload, type: 'onetime' }, // Add token type to payload
      {
        secret: this.jwtConfig.secret, // Secret key for access token
        expiresIn: this.jwtConfig.accessTokenExpiresIn, // Expiration time
      },
    );
  }

  /**
   * Generates a refresh token with the given payload.
   * This token is long-lived and used to obtain new access tokens.
   */
  async generateRefreshToken(payload: { sub: number; email: string }): Promise<string> {
    return this.jwtService.sign(
      { ...payload, type: 'refresh' }, // Add token type to payload
      {
        secret: this.jwtConfig.secret, // Secret key for refresh token
        expiresIn: this.jwtConfig.refreshTokenExpiresIn, // Expiration time
      },
    );
  }
}
