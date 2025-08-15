import { ObjectType, Field } from '@nestjs/graphql';
import { Assignment } from '../../entities/assignment.entity';

@ObjectType()
export class CreateAssignmentsOutput {
  @Field(() => [Assignment])
  assignments: Assignment[];
}
