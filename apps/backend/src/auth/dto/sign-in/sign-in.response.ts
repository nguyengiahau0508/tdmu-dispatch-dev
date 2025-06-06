import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { SignInOutput } from './sign-in.output';

@ObjectType()
export class SignInResponse extends ApiResponse(SignInOutput) { } 
