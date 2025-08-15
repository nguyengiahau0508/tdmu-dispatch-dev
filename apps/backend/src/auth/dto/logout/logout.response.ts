import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { LogoutOutput } from './logout.ouput';

@ObjectType()
export class LogoutResponse extends ApiResponse(LogoutOutput) {}
