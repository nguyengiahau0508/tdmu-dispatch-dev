import {
  BadRequestException,
  Injectable,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { ProfileService } from 'src/modules/users/profile.service';
import * as bcrypt from 'bcrypt';
import { ErrorCode } from 'src/common/enums/error-code.enum';
import { SignInOutput } from '../dto/sign-in/sign-in.output';
import { MailService } from 'src/integrations/mail/mail.service';
import { OtpService } from './otp.service';
import { SignInOtpOutput } from '../dto/sign-in-otp/sign-in-otp.output';
import { TokenService } from './token.service';
import { Response, Request } from 'express';
import { RefreshTokenOutput } from '../dto/refresh-token/refresh-token.output';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly profileService: ProfileService,
    private readonly mailService: MailService,
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Handles user sign-in logic.
   * Validates credentials and returns JWT tokens if successful.
   */
  public async signIn(
    email: string,
    pass: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<SignInOutput> {
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
      const otp = await this.otpService.generateOTP(user.id);
      this.mailService.sendOtpMail(user.email, user.fullName, otp);
      throw new UnauthorizedException({
        message: 'Bạn cần đổi mật khẩu trong lần đầu đăng nhập',
        code: ErrorCode.FIRST_LOGIN_CHANGE_PASSWORD_REQUIRED,
      });
    }

    const payload = { sub: user.id, email: user.email, role: user.roles };

    // Generate both access and refresh tokens in parallel
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(payload),
      this.tokenService.generateRefreshToken(payload),
    ]);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // bảo mật - không cho JS đọc
      secure: false, // cho phép qua HTTP (chỉ dùng trong dev)
      sameSite: 'lax', // hoặc 'none' nếu cần chia sẻ full cross-site
      path: '/', // hoặc '/graphql' nếu bạn chỉ xử lý ở đó
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    // Cập nhật thông tin đăng nhập và ghi log hoạt động
    await this.profileService.updateLastLogin(user.id, req);

    // Return tokens and basic user info
    return {
      accessToken,
      //refreshToken,
      user,
    };
  }

  public async signInWithOtp(
    email: string,
    otp: string,
  ): Promise<SignInOtpOutput> {
    // Find user by email
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      // If user does not exist, throw an error
      throw new BadRequestException({
        message: 'Tài khoản không tồn tại',
        code: ErrorCode.ACCOUNT_NOT_FOUND,
      });
    }

    const isMatch = await this.otpService.validateOTP(user.id, otp);
    if (!isMatch)
      throw new UnauthorizedException({
        message: 'Mã OTP không hợp lệ',
        code: ErrorCode.OTP_INVALID,
      });

    await this.otpService.clearOTP(user.id);

    const payload = { sub: user.id, email: user.email, role: user.roles };

    // Generate both access and refresh tokens in parallel
    const [accessToken] = await Promise.all([
      this.tokenService.generateAccessOneTimeToken(payload),
    ]);

    // Return tokens and basic user info
    return {
      accessToken,
    };
  }

  async sentOtp(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      // If user does not exist, throw an error
      throw new BadRequestException({
        message: 'Tài khoản không tồn tại',
        code: ErrorCode.ACCOUNT_NOT_FOUND,
      });
    }

    const otp = await this.otpService.generateOTP(user.id);
    this.mailService.sendOtpMail(user.email, user.fullName, otp);
  }

  async refreshToken(@Req() req: Request): Promise<RefreshTokenOutput> {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken)
      throw new UnauthorizedException({
        message: 'Có lổi xảy ra',
        code: ErrorCode.TOKEN_INVALID,
      });
    const decode = await this.tokenService.extractToken(refreshToken);

    const accessToken = await this.tokenService.generateAccessToken({
      sub: decode.sub,
      email: decode.email,
      role: decode.role,
    });

    return {
      accessToken,
    };
  }

  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken)
      throw new UnauthorizedException({
        message: 'Có lổi xảy ra',
        code: ErrorCode.TOKEN_INVALID,
      });
    const decode = await this.tokenService.extractToken(refreshToken);

    await this.tokenService.revokeToken(decode.tokenId);
    res.clearCookie('refreshToken');
  }
}
