import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { createResponseMetadata } from 'src/common/helpers/metadata.helper';
import { HttpStatus, UseGuards } from '@nestjs/common';
import { SignInResponse } from './dto/sign-in/sign-in.response';
import { SignInInput } from './dto/sign-in/sign-in.input';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthService } from './services/auth.service';
import { SignInOtpInput } from './dto/sign-in-otp/sign-in-otp.input';
import { SignInOtpResponse } from './dto/sign-in-otp/sign-in-otp.response';
import { Request, Response } from 'express';
import { SentOtpResponse } from './dto/sent-otp/sent-otp.response';
import { SentOtpInput } from './dto/sent-otp/sent-opt.input';
import { RefreshTokenReponse } from './dto/refresh-token/refresh-token.response';
import { LogoutResponse } from './dto/logout/logout.response';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }

  @Mutation(() => SignInResponse)
  @Public()
  async signIn(@Args('input') input: SignInInput, @Context('res') res: Response): Promise<SignInResponse> {
    const result = await this.authService.signIn(input.email, input.password, res);
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, ""),
      data: result
    };
  }

  @Mutation(() => SignInOtpResponse)
  @Public()
  async signInWithOtp(@Args('input') input: SignInOtpInput): Promise<SignInOtpResponse> {
    const result = await this.authService.signInWithOtp(input.email, input.otp);
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, ""),
      data: result
    };
  }


  @Mutation(() => SentOtpResponse)
  @Public()
  async sentOtp(@Args('input') input: SentOtpInput): Promise<SentOtpResponse> {
    await this.authService.sentOtp(input.email);
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, ""),
      data: {
        status: true
      }
    }
  }

  @Mutation(() => RefreshTokenReponse)
  @Public()
  async refreshToken(@Context('req') req: Request): Promise<RefreshTokenReponse> {
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, ""),
      data: await this.authService.refreshToken(req)
    }
  }

  @Mutation(() => LogoutResponse)
  async logout(
    @Context('req') req: Request,
    @Context('res') res: Response
  ): Promise<LogoutResponse> {
    await this.authService.logout(req, res)
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, ""),
      data: {
        status: true
      }
    }
  }
}

