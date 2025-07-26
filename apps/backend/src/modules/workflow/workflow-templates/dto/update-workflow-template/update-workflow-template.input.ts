import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateWorkflowTemplateInput } from '../create-workflow-template/create-workflow-template.input';

@InputType()
export class UpdateWorkflowTemplateInput extends PartialType(CreateWorkflowTemplateInput) {
  @Field(() => Int)
  id: number;
}
