import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { ChangePasswordOutput } from './change-password.output';

@ObjectType()
export class ChangePasswordResponse extends ApiResponse(ChangePasswordOutput) {}
