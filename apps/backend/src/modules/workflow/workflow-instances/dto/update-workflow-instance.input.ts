import { CreateWorkflowInstanceInput } from './create-workflow-instance.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateWorkflowInstanceInput extends PartialType(CreateWorkflowInstanceInput) {
  @Field(() => Int)
  id: number;
}
