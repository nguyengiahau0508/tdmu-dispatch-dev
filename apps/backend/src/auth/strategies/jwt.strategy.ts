

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IJwtConfig } from 'src/config/interfaces';
import { ErrorCode } from 'src/common/enums/error-code.enum';
import { ITokenPayload } from '../services/token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService
  ) {
    const jwtConfig = configService.get<IJwtConfig>('jwt');
    if (!jwtConfig) {
      // Throw an exception if the config is missing
      throw new InternalServerErrorException();
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig?.secret,
    });
  }

  async validate(payload: ITokenPayload) {
    if (payload.type == "refresh") {
      throw new UnauthorizedException({
        message: 'Xác thực thất bại',
        code: ErrorCode.REFRESH_TOKEN_MISUSED,
      });
    }
    return { userId: payload.sub, username: payload.email, role: payload.role };
  }
}
