import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IJwtConfig } from 'src/config/interfaces';
import { ErrorCode } from 'src/common/enums/error-code.enum';
import { ITokenPayload, TokenService } from '../services/token.service';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly userService: UsersService,
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
    const isValid = await this.tokenService.isTokenValid(payload.tokenId);
    if (!isValid) {
      throw new UnauthorizedException({
        message: 'Xác thực thất bại',
        code: ErrorCode.TOKEN_INVALID,
      });
    }

    if (payload.type == 'refresh') {
      throw new UnauthorizedException({
        message: 'Xác thực thất bại',
        code: ErrorCode.REFRESH_TOKEN_MISUSED,
      });
    }

    if (payload.type == 'onetime') {
      await this.tokenService.revokeToken(payload.tokenId);
    }

    const currentUser = await this.userService.findOneById(payload.sub);
    console.log('🔍 Debug JWT Strategy:');
    console.log('  - User ID:', currentUser?.id);
    console.log('  - User email:', currentUser?.email);
    console.log('  - User roles:', currentUser?.roles);
    console.log('  - User roles type:', typeof currentUser?.roles);
    console.log('  - User isActive:', currentUser?.isActive);
    return currentUser;
  }
}
