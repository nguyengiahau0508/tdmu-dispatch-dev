import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { CreateAssignmentsOutput } from './create-assignments.output';

@ObjectType()
export class CreateAssignmentsResponse extends ApiResponse(
  CreateAssignmentsOutput,
) {}
