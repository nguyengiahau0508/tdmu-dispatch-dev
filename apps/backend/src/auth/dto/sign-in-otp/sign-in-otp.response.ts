import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { SignInOtpOutput } from './sign-in-otp.output';

@ObjectType()
export class SignInOtpResponse extends ApiResponse(SignInOtpOutput) {}
