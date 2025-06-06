
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { IJwtConfig } from 'src/config/interfaces';
import { JwtService } from '@nestjs/jwt';
import { ErrorCode } from 'src/common/enums/error-code.enum';
import { Role } from 'src/common/enums/role.enums';
import { SignInOutput } from '../dto/sign-in/sign-in.output';
import { MailService } from 'src/integrations/mail/mail.service';
import { OtpService } from './otp.service';

// Defines the structure of JWT token payloads
export interface ITokenPayload {
  sub: number;
  email: string;
  type: 'access' | 'refresh';
  role: Role
}

@Injectable()
export class AuthService {
  private readonly jwtConfig: IJwtConfig;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly otpService: OtpService
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
  private async generateAccessToken(payload: { sub: number; email: string, role: Role }): Promise<string> {
    return this.jwtService.sign(
      { ...payload, type: 'access' }, // Add token type to payload
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
  private async generateRefreshToken(payload: { sub: number; email: string }): Promise<string> {
    return this.jwtService.sign(
      { ...payload, type: 'refresh' }, // Add token type to payload
      {
        secret: this.jwtConfig.secret, // Secret key for refresh token
        expiresIn: this.jwtConfig.refreshTokenExpiresIn, // Expiration time
      },
    );
  }

  /**
   * Handles user sign-in logic.
   * Validates credentials and returns JWT tokens if successful.
   */
  public async signIn(email: string, pass: string): Promise<SignInOutput> {
    // Find user by email
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      // If user does not exist, throw an error
      throw new BadRequestException({
        message: 'Tài khoản không tồn tại',
        code: ErrorCode.ACCOUNT_NOT_FOUND,
      });
    }

    // Compare input password with stored password hash
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      // If passwords do not match, throw an error
      throw new UnauthorizedException({
        message: 'Mật khẩu không chính xác',
        code: ErrorCode.PASSWORD_INCORRECT,
      });
    }

    if (user.isFirstLogin) {
      const otp = await this.otpService.generateOTP(user.id)
      await this.mailService.sendOtpMail(user.email, user.fullName, otp)
      throw new UnauthorizedException({
        message: 'Bạn cần đổi mật khẩu trong lần đầu đăng nhập',
        code: ErrorCode.FIRST_LOGIN_CHANGE_PASSWORD_REQUIRED,
      });
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    // Generate both access and refresh tokens in parallel
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    // Return tokens and basic user info
    return {
      accessToken,
      refreshToken,
      user
    };
  }

}

