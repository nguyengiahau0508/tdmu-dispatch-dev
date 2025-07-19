import { CreateWorkflowActionLogInput } from './create-workflow-action-log.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateWorkflowActionLogInput extends PartialType(CreateWorkflowActionLogInput) {
  @Field(() => Int)
  id: number;
}
