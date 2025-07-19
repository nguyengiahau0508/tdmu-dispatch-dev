import { CreateWorkflowTemplateInput } from './create-workflow-template.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateWorkflowTemplateInput extends PartialType(CreateWorkflowTemplateInput) {
  @Field(() => Int)
  id: number;
}
