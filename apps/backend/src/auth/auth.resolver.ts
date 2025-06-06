import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { createResponseMetadata } from 'src/common/helpers/metadata.helper';
import { HttpStatus } from '@nestjs/common';
import { SignInResponse } from './dto/sign-in/sign-in.response';
import { SignInInput } from './dto/sign-in/sign-in.input';
import { Public } from 'src/common/decorators/public.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }

  @Mutation(() => SignInResponse)
  @Public()
  async signIn(@Args('input') input: SignInInput): Promise<SignInResponse> {
    const result = await this.authService.signIn(input.email, input.password);
    return {
      metadata: createResponseMetadata(HttpStatus.ACCEPTED, ""),
      data: result
    };
  }
}

