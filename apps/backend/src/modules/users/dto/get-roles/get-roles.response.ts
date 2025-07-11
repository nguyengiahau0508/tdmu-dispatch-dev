import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { GetRolesOutput } from './get-roles.output';

@ObjectType()
export class GetRolesResponse extends ApiResponse(GetRolesOutput) {} 