import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { SentOtpOutput } from './sent-otp.output';

@ObjectType()
export class SentOtpResponse extends ApiResponse(SentOtpOutput) {}
