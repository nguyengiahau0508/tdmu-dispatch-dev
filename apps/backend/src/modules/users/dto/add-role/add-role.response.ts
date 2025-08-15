import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { AddRoleOutput } from './add-role.output';

@ObjectType()
export class AddRoleResponse extends ApiResponse(AddRoleOutput) {}
