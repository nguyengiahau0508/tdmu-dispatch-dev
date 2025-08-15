import { ObjectType } from '@nestjs/graphql';
import { ApiResponse } from 'src/common/graphql/api-response.dto';
import { UpdateAssignmentOutput } from './update-assignment.output';

@ObjectType()
export class UpdateAssignmentResponse extends ApiResponse(
  UpdateAssignmentOutput,
) {}
