import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { CreateAssignmentOutput } from './create-assignment.output';

@ObjectType()
export class CreateAssignmentResponse extends ApiResponse(
  CreateAssignmentOutput,
) {}
