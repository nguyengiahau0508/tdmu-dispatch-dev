import { CreateWorkflowStepInput } from './create-workflow-step.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateWorkflowStepInput extends PartialType(CreateWorkflowStepInput) {
  @Field(() => Int)
  id: number;
}
