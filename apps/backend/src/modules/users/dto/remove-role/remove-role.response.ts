import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { RemoveRoleOutput } from './remove-role.output';

@ObjectType()
export class RemoveRoleResponse extends ApiResponse(RemoveRoleOutput) {}
