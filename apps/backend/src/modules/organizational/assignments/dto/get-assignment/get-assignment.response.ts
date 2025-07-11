import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { GetAssignmentOutput } from './get-assignment.output';

@ObjectType()
export class GetAssignmentResponse extends ApiResponse(GetAssignmentOutput) {} 