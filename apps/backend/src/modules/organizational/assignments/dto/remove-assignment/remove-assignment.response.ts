import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { RemoveAssignmentOutput } from './remove-assignment.output';

@ObjectType()
export class RemoveAssignmentResponse extends ApiResponse(RemoveAssignmentOutput) {} 